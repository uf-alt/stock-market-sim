"use client";

import { GraduationCap, Users, BarChart2, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Class Leaderboard",
    description: "Compete against your classmates and see how your portfolio stacks up.",
  },
  {
    icon: BarChart2,
    title: "Instructor Analytics",
    description: "Your teacher can track class-wide performance and assign trading challenges.",
  },
  {
    icon: GraduationCap,
    title: "Assignments",
    description: "Complete structured trading assignments set by your instructor.",
  },
];

export default function ClassPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Hero */}
      <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
          <GraduationCap size={26} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1">Join a Class</h2>
          <p className="text-[14px] text-muted-foreground">
            Enter a class code from your instructor to connect your account to a class.
          </p>
        </div>

        {/* Code input — non-functional placeholder */}
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            type="text"
            placeholder="Enter class code"
            disabled
            className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-[13px] text-foreground font-mono outline-none opacity-50 cursor-not-allowed"
          />
          <button
            disabled
            className="flex items-center gap-1.5 px-4 py-2 bg-primary/50 text-primary-foreground rounded-md text-[13px] font-semibold cursor-not-allowed opacity-50"
          >
            <Lock size={12} />
            Join
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground/60">
          Class features are coming soon.
        </p>
      </div>

      {/* Feature previews */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1">
          What&apos;s included
        </p>
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-card border border-border rounded-xl px-5 py-4 flex items-start gap-4 opacity-60"
          >
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon size={16} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground mb-0.5">{title}</p>
              <p className="text-[12px] text-muted-foreground">{description}</p>
            </div>
            <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground/50 font-semibold self-center whitespace-nowrap">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
