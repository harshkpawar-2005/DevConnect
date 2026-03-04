import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/* === FEATURE CARD COMPONENT === */
// We use export default to send this component to other files
export default function FeatureCard({ icon, title, description }) {
  return (
    <Card className="transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-400 
                  group cursor-pointer rounded-xl">

      <CardHeader>

        {/* Glowing icon */}
        <div className="mb-4 h-12 w-12 rounded-full 
                      bg-gradient-to-br from-sky-400 to-blue-600 
                      flex items-center justify-center
                      transition-all duration-300 
                      group-hover:scale-110 
                      group-hover:shadow-lg 
                      group-hover:shadow-blue-400/50">

          {React.cloneElement(icon, { className: "h-6 w-6 text-white" })}
        </div>

        <CardTitle className="group-hover:text-blue-600 transition-colors">
          {title}
        </CardTitle>

        <CardDescription className="group-hover:text-slate-600 transition-colors">
          {description}
        </CardDescription>

      </CardHeader>

    </Card>
  );
}