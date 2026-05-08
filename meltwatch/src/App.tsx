import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { LogoBar } from "@/components/LogoBar";
import { Stats } from "@/components/Stats";
import { CoreCapabilities } from "@/components/CoreCapabilities";
import { ServiceSections } from "@/components/ServiceSections";
import { Differentiator } from "@/components/Differentiator";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { DemoLayout } from "@/pages/DemoLayout";
import { DemoHome } from "@/pages/DemoHome";
import { DemoExplore } from "@/pages/DemoExplore";
import { DemoMonitor } from "@/pages/DemoMonitor";
import { DemoAnalytics } from "@/pages/DemoAnalytics";
import { DemoInfluencer } from "@/pages/DemoInfluencer";
import { DemoCompetitive } from "@/pages/DemoCompetitive";
import { DemoReport } from "@/pages/DemoReport";
import { DemoAlerts } from "@/pages/DemoAlerts";
import { DemoAccount } from "@/pages/DemoAccount";

function HomePage() {
  return (
    <div className="min-h-screen bg-cream text-ink antialiased">
      <Navbar />
      <main>
        <Hero />
        <LogoBar />
        <Differentiator />
        <Stats />
        <CoreCapabilities />
        <ServiceSections />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<Navigate to="/demo" replace />} />
        <Route path="/demo" element={<DemoLayout />}>
          <Route index element={<DemoHome />} />
          <Route path="explore"    element={<DemoExplore />} />
          <Route path="monitor"    element={<DemoMonitor />} />
          <Route path="analytics"  element={<DemoAnalytics />} />
          <Route path="influencer"  element={<DemoInfluencer />} />
          <Route path="competitive" element={<DemoCompetitive />} />
          <Route path="report"      element={<DemoReport />} />
          <Route path="alerts"      element={<DemoAlerts />} />
          <Route path="account"     element={<DemoAccount />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
