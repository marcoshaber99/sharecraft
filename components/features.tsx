import { Palette, Share2, Type, Sparkles } from "lucide-react";

const features = [
  {
    icon: Share2,
    title: "One-Click Sharing",
    description:
      "Instantly share your activities to social media or copy to clipboard with a single tap.",
  },
  {
    icon: Palette,
    title: "Custom Styles",
    description:
      "Choose from beautiful gradients and backgrounds to make your activity shares stand out.",
  },
  {
    icon: Type,
    title: "Flexible Typography",
    description:
      "Select from modern fonts and customize sizes to highlight what matters most.",
  },
  {
    icon: Sparkles,
    title: "Smart Stats",
    description:
      "Pick and choose which activity stats to display, from basic metrics to detailed performance data.",
  },
];

export function Features() {
  return (
    <section className="w-full">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-geist font-bold tracking-tight">
            Designed for Sharing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create eye-catching activity cards that look great on any platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 p-6 rounded-lg bg-background border"
            >
              <feature.icon className="h-6 w-6 flex-shrink-0 text-[#FC4C02]" />
              <div className="space-y-1">
                <h3 className="font-medium font-geist">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
