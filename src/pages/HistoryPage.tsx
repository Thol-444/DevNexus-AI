import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Clock, Code2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const HistoryPage = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("submissions")
        .select("id, language, source_code, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setSubmissions(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Submission History</h1>

        {loading ? (
          <div className="glass rounded-xl p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No submissions yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Head to the <Link to="/analyzer" className="text-primary hover:underline">Analyzer</Link> to submit your first code!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-4 flex items-center justify-between hover:shadow-glow transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                      {sub.language}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <pre className="text-sm text-muted-foreground font-mono truncate">
                    {sub.source_code.substring(0, 100)}...
                  </pre>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HistoryPage;
