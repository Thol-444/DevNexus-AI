import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, History, TrendingUp, Zap, Code2, ArrowRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const Dashboard = () => {
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({ submissions: 0, streak: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user.id)
        .single();
      
      if (profile) setUserName(profile.name || "Coder");

      const { data: progress } = await supabase
        .from("user_progress")
        .select("total_submissions, streak_days")
        .eq("user_id", user.id)
        .single();

      if (progress) setStats({ submissions: progress.total_submissions, streak: progress.streak_days });
    };
    load();
  }, []);

  const cards = [
    {
      title: "Analyze Code",
      description: "Submit code for AI-powered analysis, optimization, and interview prep",
      icon: Terminal,
      path: "/analyzer",
      gradient: "gradient-primary",
    },
    {
      title: "History",
      description: "View your past submissions and analysis results",
      icon: History,
      path: "/history",
      gradient: "gradient-accent",
    },
    {
      title: "Progress",
      description: "Track your learning journey and identify weak areas",
      icon: TrendingUp,
      path: "/progress",
      gradient: "from-success to-info",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            Welcome back, <span className="text-gradient-primary">{userName || "Coder"}</span>
          </motion.h1>
          <p className="text-muted-foreground mt-1">Ready to sharpen your coding skills?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Submissions", value: stats.submissions, icon: Code2 },
            { label: "Day Streak", value: stats.streak, icon: Zap },
            { label: "AI Analyses", value: stats.submissions, icon: Terminal },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-primary/50" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link
                to={card.path}
                className="block glass rounded-xl p-6 hover:shadow-glow transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-lg ${card.gradient} flex items-center justify-center mb-4`}>
                  <card.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{card.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
                <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get Started <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
