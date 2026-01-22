import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import './index.css'
import { ThemeProvider } from './providers/theme-provider'
import Router from './Router'
import { Toaster } from "sonner"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			// staleTime: 1000 * 60 * 5, // 5 minutes
		},
		mutations: {
			retry: false,
		},
	}
})

function App() {

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<Router />
				<Toaster
					position="bottom-center"
					richColors
					toastOptions={{
						classNames: {
							error: 'text-white bg-destructive',
							success: 'text-white bg-primary',
							warning: 'text-yellow-400',
							info: 'bg-blue-400',
						},
					}}
				/>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

export default App
