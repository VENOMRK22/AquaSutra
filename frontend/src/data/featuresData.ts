import { History, Trophy, Users } from 'lucide-react';

export const featuresData = [
    {
        id: 1,
        title: "Time Travel Simulator",
        description: "Visualize your crop's future before you sow. Our predictive graph technology analyzes soil data and weather patterns to prevent crop failure weeks in advance.",
        icon: History,
        stats: "98% Accuracy",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop", // Graph/Analysis visual
        ctaText: "Simulate Now"
    },
    {
        id: 2,
        title: "Water Credit Score",
        description: "Gamify your sustainability journey. Earn points for every drop saved and unlock premium market rates. Watch your green score grow as you farm smarter.",
        icon: Trophy,
        stats: "+150 pts this week",
        image: "https://images.unsplash.com/photo-1574943320219-55ca80997527?q=80&w=1000&auto=format&fit=crop", // Success/Growth visual
        ctaText: "View Score"
    },
    {
        id: 3,
        title: "Community Water Pool",
        description: "Join forces with your village. Track collective groundwater levels and budget usage together. A shared resource needs shared responsibility.",
        icon: Users,
        stats: "12 Farms Connected",
        image: "https://images.unsplash.com/photo-1625246333195-bf436c846665?q=80&w=1000&auto=format&fit=crop", // Community/Farm visual
        ctaText: "Join Pool"
    }
];
