import { FileTextIcon, SendIcon, UploadIcon, UsersIcon } from "lucide-react"

import EYPLEASE_ICON from "@/assets/images/icon-white.png"

/** Áreas del panel que la clienta encuentra al entrar. */
const AUTH_HIGHLIGHTS = [
	{ Icon: SendIcon, title: 'Publicaciones', description: 'Listas para compartir con tu equipo' },
	{ Icon: FileTextIcon, title: 'Boletines', description: 'Armados con la información del mes' },
	{ Icon: UploadIcon, title: 'Reportes', description: 'Carga tus archivos en minutos' },
	{ Icon: UsersIcon, title: 'Mi Unidad', description: 'Tus vendedoras y directoras, al día' },
]

interface Props {
	children: React.ReactNode;
}

const AuthLayout = ({ children }: Props) => {
	return (
		<div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
			<aside className="relative hidden flex-col justify-between overflow-hidden bg-auth-panel p-12 lg:flex">
				<img
					src={EYPLEASE_ICON}
					alt=""
					aria-hidden
					className="pointer-events-none absolute -right-16 -bottom-12 w-80 opacity-[0.08]"
				/>

				<div className="relative">
					<span className="grid size-12 place-content-center rounded-[14px] border border-white/25 bg-white/15 backdrop-blur-sm">
						<img src={EYPLEASE_ICON} alt="Eyplease" className="size-6" />
					</span>
					<h1 className="mt-6 max-w-90 text-[29px] font-extrabold leading-tight tracking-tight text-white">
						El panel de tu Unidad.
					</h1>
					<p className="mt-2.5 max-w-95 text-[15px] font-medium text-white/70">
						Todo lo del mes, listo cuando entras.
					</p>
				</div>

				<ul className="relative grid max-w-95 gap-2.5">
					{AUTH_HIGHLIGHTS.map(({ Icon, title, description }) => (
						<li
							key={title}
							className="flex items-center gap-3 rounded-[14px] border border-white/15 bg-white/[0.09] px-3.5 py-2.5 backdrop-blur-sm"
						>
							<span className="grid size-8 shrink-0 place-content-center rounded-[10px] bg-white/15 text-secondary">
								<Icon className="size-4" />
							</span>
							<span className="min-w-0">
								<span className="block text-[13.5px] font-bold text-white">{title}</span>
								<span className="block text-xs font-medium text-white/60">{description}</span>
							</span>
						</li>
					))}
				</ul>

				<p className="relative text-xs font-semibold tracking-wide text-white/50">Eyplease+</p>
			</aside>

			<main className="flex items-center justify-center bg-card px-5 py-12">
				<div className="w-full max-w-90 text-center">
					<span className="mx-auto mb-5 grid size-13 place-content-center rounded-brand bg-primary-gradient shadow-primary-glow">
						<img src={EYPLEASE_ICON} alt="Eyplease" className="size-9" />
					</span>
					{children}
				</div>
			</main>
		</div>
	)
}

export default AuthLayout
