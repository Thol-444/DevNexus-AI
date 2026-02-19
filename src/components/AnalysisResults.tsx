import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, AlertTriangle, Zap, BookOpen, HelpCircle, Building2, Puzzle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalysisResultsProps {
  analysis: any;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground">
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
};

const CodeBlock = ({ code, language }: { code: string; language?: string }) => (
  <div className="relative group">
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <CopyButton text={code} />
    </div>
    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
      <code>{code}</code>
    </pre>
  </div>
);

const Section = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
      {Icon && <Icon className="w-5 h-5 text-primary" />}
      {title}
    </h3>
    {children}
  </div>
);

const AnalysisResults = ({ analysis }: AnalysisResultsProps) => {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <Tabs defaultValue="errors" className="w-full">
        <div className="border-b border-border overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 rounded-none w-full justify-start">
            {[
              { value: "errors", label: "Errors", icon: AlertTriangle },
              { value: "optimized", label: "Optimized", icon: Zap },
              { value: "complexity", label: "Complexity", icon: Clock },
              { value: "explanation", label: "Explanation", icon: BookOpen },
              { value: "interview", label: "Interview Q's", icon: HelpCircle },
              { value: "viva", label: "Viva Q's", icon: HelpCircle },
              { value: "companies", label: "Companies", icon: Building2 },
              { value: "practice", label: "Practice", icon: Puzzle },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap"
              >
                <tab.icon className="w-4 h-4 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="errors" className="mt-0 space-y-4">
            <Section title="Error Analysis" icon={AlertTriangle}>
              <p className="text-secondary-foreground text-sm leading-relaxed whitespace-pre-wrap">{analysis.error_analysis}</p>
            </Section>
            <Section title="Corrected Code">
              <CodeBlock code={analysis.corrected_code || "No corrections needed."} />
              {analysis.correction_explanation && (
                <p className="text-sm text-muted-foreground mt-2">{analysis.correction_explanation}</p>
              )}
            </Section>
          </TabsContent>

          <TabsContent value="optimized" className="mt-0 space-y-4">
            <Section title="Optimized Code" icon={Zap}>
              <CodeBlock code={analysis.optimized_code || "Already optimal."} />
            </Section>
            {analysis.optimization_strategy && (
              <Section title="Optimization Strategy">
                <p className="text-secondary-foreground text-sm leading-relaxed whitespace-pre-wrap">{analysis.optimization_strategy}</p>
              </Section>
            )}
          </TabsContent>

          <TabsContent value="complexity" className="mt-0 space-y-4">
            <Section title="Time & Space Complexity" icon={Clock}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Time Complexity</p>
                  <p className="text-foreground font-mono font-semibold">{analysis.time_complexity}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Space Complexity</p>
                  <p className="text-foreground font-mono font-semibold">{analysis.space_complexity}</p>
                </div>
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="explanation" className="mt-0 space-y-4">
            <Section title="Step-by-Step Explanation" icon={BookOpen}>
              <p className="text-secondary-foreground text-sm leading-relaxed whitespace-pre-wrap">{analysis.step_by_step}</p>
            </Section>
            {analysis.conceptual_dive && (
              <Section title="Conceptual Deep Dive">
                <p className="text-secondary-foreground text-sm leading-relaxed whitespace-pre-wrap">{analysis.conceptual_dive}</p>
              </Section>
            )}
          </TabsContent>

          <TabsContent value="interview" className="mt-0 space-y-6">
            <Section title="Interview Questions" icon={HelpCircle}>
              {["easy", "medium", "hard"].map((level) => (
                <div key={level} className="space-y-3">
                  <Badge variant={level === "easy" ? "secondary" : level === "medium" ? "default" : "destructive"} className="capitalize">
                    {level}
                  </Badge>
                  {(analysis.interview_questions?.[level] || []).map((q: any, i: number) => (
                    <details key={i} className="bg-muted rounded-lg group">
                      <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                        {i + 1}. {q.question}
                      </summary>
                      <div className="px-4 pb-3 text-sm text-muted-foreground">{q.answer}</div>
                    </details>
                  ))}
                </div>
              ))}
            </Section>
          </TabsContent>

          <TabsContent value="viva" className="mt-0 space-y-3">
            <Section title="Viva Questions" icon={HelpCircle}>
              {(analysis.viva_questions || []).map((q: any, i: number) => (
                <details key={i} className="bg-muted rounded-lg">
                  <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-foreground hover:text-primary transition-colors">
                    {i + 1}. {q.question}
                  </summary>
                  <div className="px-4 pb-3 text-sm text-muted-foreground">{q.answer}</div>
                </details>
              ))}
            </Section>
          </TabsContent>

          <TabsContent value="companies" className="mt-0 space-y-4">
            <Section title="Company Relevance" icon={Building2}>
              <div className="grid gap-3">
                {(analysis.company_relevance || []).map((c: any, i: number) => (
                  <div key={i} className="bg-muted rounded-lg p-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{c.company}</p>
                      <p className="text-sm text-muted-foreground mt-1">{c.similar_pattern}</p>
                      <p className="text-xs text-muted-foreground mt-1">Round: {c.interview_round}</p>
                    </div>
                    <Badge variant={c.relevance === "High" ? "default" : "secondary"}>
                      {c.relevance}
                    </Badge>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="practice" className="mt-0 space-y-4">
            <Section title="Related Practice Problems" icon={Puzzle}>
              <div className="grid gap-3">
                {(analysis.practice_problems || []).map((p: any, i: number) => (
                  <div key={i} className="bg-muted rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{p.title}</p>
                      <Badge variant="outline" className="text-xs">{p.difficulty}</Badge>
                      <Badge variant="secondary" className="text-xs">{p.platform}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                    <p className="text-xs text-primary mt-1">{p.why_related}</p>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AnalysisResults;
