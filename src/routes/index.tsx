import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Experience } from "@/components/portfolio/Experience";
import { Tools } from "@/components/portfolio/Tools";
import { Skills } from "@/components/portfolio/Skills";
import { Certifications } from "@/components/portfolio/Certifications";
import { Projects } from "@/components/portfolio/Projects";
import { Achievements } from "@/components/portfolio/Achievements";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { loadCmsFn } from "@/server-fns/cms";

export const Route = createFileRoute("/")({
  loader: () => loadCmsFn(),
  component: Index,
});

function Index() {
  const cms = Route.useLoaderData();
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: cms.hero.name,
    jobTitle: cms.hero.title1,
    description: cms.hero.description,
    address: { "@type": "PostalAddress", addressLocality: "Giza", addressCountry: "Egypt" },
    knowsAbout: ["Manual Testing", "API Testing", "Automation Testing", "Selenium", "Postman", "Rest Assured", "JMeter", "Java", "SQL", "ISTQB"],
  };
  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <Navbar />
      <Hero data={cms.hero} />
      <About data={cms.about} />
      <Experience data={cms.experiences} />
      <Tools data={cms.tools} />
      <Skills data={cms.skills} />
      <Certifications data={cms.certifications} />
      <Projects data={cms.projects} />
      <Achievements data={cms.achievements} />
      <Contact contactData={cms.contact} />
      <Footer data={cms.footer} />
    </main>
  );
}
