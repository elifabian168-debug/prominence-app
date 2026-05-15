import { Dumbbell, BookOpen, Heart, Briefcase, Brain, Swords, Sparkles } from "lucide-react";

export const CATEGORIES = {
  fitness: { label: "Body",     icon: Dumbbell,  color: "#E8B14A", stat: "strength",   attribute: "Strength"   },
  school:  { label: "Learning", icon: BookOpen,  color: "#7CA9F2", stat: "intellect",  attribute: "Intellect"  },
  life:    { label: "Personal", icon: Heart,     color: "#E89B8A", stat: "vitality",   attribute: "Vitality"   },
  work:    { label: "Work",    icon: Briefcase, color: "#A78BFA", stat: "craft",      attribute: "Craft"      },
  mind:    { label: "Mind",    icon: Brain,     color: "#6EE7B7", stat: "discipline", attribute: "Discipline" },
};

export const ARCHETYPES = {
  warrior:  { label: "Warrior",  icon: Swords,    color: "#E8B14A", desc: "Forged by the body"    },
  scholar:  { label: "Scholar",  icon: BookOpen,  color: "#7CA9F2", desc: "Driven by learning"    },
  monk:     { label: "Monk",     icon: Brain,     color: "#6EE7B7", desc: "Master of mind"        },
  artisan:  { label: "Artisan",  icon: Briefcase, color: "#A78BFA", desc: "Builder of craft"      },
  vitalist: { label: "Vitalist", icon: Heart,     color: "#E89B8A", desc: "Master of the personal" },
  balanced: { label: "Balanced", icon: Sparkles,  color: "#A8A8B3", desc: "Harmonized in all"     },
};
