import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import toast, { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient()


ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
		<QueryClientProvider client={queryClient}>
		<App />
		</QueryClientProvider>
			
		<Toaster />
		</BrowserRouter>
	</React.StrictMode>
);
