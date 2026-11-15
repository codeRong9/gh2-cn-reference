import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";

const Home = lazy(() => import("./pages/Home"));
const Library = lazy(() => import("./pages/Library"));
const ComponentDetail = lazy(() => import("./pages/ComponentDetail"));
const Identify = lazy(() => import("./pages/Identify"));
const Learn = lazy(() => import("./pages/Learn"));
const Lesson = lazy(() => import("./pages/Lesson"));
const Recipes = lazy(() => import("./pages/Recipes"));
const Glossary = lazy(() => import("./pages/Glossary"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-[1320px] items-center justify-center px-6">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
        <span className="text-small">正在加载组件数据…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/c/:id" element={<ComponentDetail />} />
          <Route path="/identify" element={<Identify />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:slug" element={<Lesson />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
