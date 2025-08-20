import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "@/components/bugs/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<ErrorBoundary>
			<Suspense fallback={<div className="p-6">Loading…</div>}>
				<App />
			</Suspense>
		</ErrorBoundary>
	</React.StrictMode>,
);
