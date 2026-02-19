import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Target, Award } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const Progress = () => {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProgress(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const stats = [
    { label: "Total Submissions", value: progress?.total_submissions || 0, icon: Target, color: "text-primary" },
    { label: "Easy Solved", value: progress?.easy_questions_solved || 0, icon: Award, color: "text-success" },
    { label: "Medium Solved", value: progress?.medium_questions_solved || 0, icon: TrendingUp, color: "text-warning" },
    { label: "Hard Solved", value: progress?.hard_questions_solved || 0, icon: Zap, color: "text-destructive" },
    { label: "Streak Days", value: progress?.streak_days || 0, icon: Zap, color: "text-primary" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Progress Tracker</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Keep Going!</h2>
          <p className="text-muted-foreground text-sm">
            Submit more code to the analyzer to track your progress. Each submission helps identify your strengths and areas for improvement.
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Progress;
