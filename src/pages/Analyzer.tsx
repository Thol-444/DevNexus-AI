import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/components/AppLayout";
import CodeEditor from "@/components/CodeEditor";
import AnalysisResults from "@/components/AnalysisResults";

const languages = [
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
];

const Analyzer = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to analyze");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        return;
      }

      // Call edge function
      const { data, error } = await supabase.functions.invoke("analyze-code", {
        body: { source_code: code, language },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data.analysis;

      // Save submission
      const { data: submission, error: subErr } = await supabase
        .from("submissions")
        .insert({ user_id: user.id, language, source_code: code })
        .select()
        .single();

      if (subErr) console.error("Failed to save submission:", subErr);

      if (submission) {
        // Save analysis
        const { data: analysisRow } = await supabase
          .from("analyses")
          .insert({
            submission_id: submission.id,
            error_analysis: result.error_analysis,
            corrected_code: result.corrected_code,
            optimized_code: result.optimized_code,
            complexity: JSON.stringify({ time: result.time_complexity, space: result.space_complexity }),
            explanation: result.step_by_step,
            conceptual_dive: result.conceptual_dive,
            company_relevance: result.company_relevance,
            practice_problems: result.practice_problems,
          })
          .select()
          .single();

        if (analysisRow) {
          // Save questions
          const questions: any[] = [];
          ["easy", "medium", "hard"].forEach((type) => {
            (result.interview_questions?.[type] || []).forEach((q: any) => {
              questions.push({
                analysis_id: analysisRow.id,
                question_type: type,
                question_text: q.question,
                answer_text: q.answer,
              });
            });
          });
          (result.viva_questions || []).forEach((q: any) => {
            questions.push({
              analysis_id: analysisRow.id,
              question_type: "viva",
              question_text: q.question,
              answer_text: q.answer,
            });
          });

          if (questions.length > 0) {
            await supabase.from("generated_questions").insert(questions);
          }
        }

        // Update progress
        try {
          await supabase
            .from("user_progress")
            .update({ last_active: new Date().toISOString().split("T")[0] } as any)
            .eq("user_id", user.id);
        } catch {
          // silently fail
        }
      }

      setAnalysis({ ...result, source_code: code, language });
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Code Analyzer</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Paste your code below for AI-powered analysis, optimization, and interview prep
          </p>
        </div>

        <div className="glass rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-48 bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAnalyze}
              disabled={loading || !code.trim()}
              className="gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Analyze Code
                </>
              )}
            </Button>
          </div>

          <CodeEditor value={code} onChange={setCode} language={language} />
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-xl p-12 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-foreground font-medium">Analyzing your code with AI...</p>
              <p className="text-muted-foreground text-sm mt-1">This may take 15-30 seconds</p>
            </motion.div>
          )}

          {analysis && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnalysisResults analysis={analysis} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Analyzer;
