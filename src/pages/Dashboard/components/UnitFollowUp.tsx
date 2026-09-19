import { useNavigate } from 'react-router'
import { SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IconBySection } from '@/components/generics/IconBySection'
import { cn } from '@/lib/utils'
import { APP_ROUTES } from '@/constants/app'
import { PermissionKeys } from '@/interfaces/permissions'
import { MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'
import { usePostsStore } from '@/store/posts'
import useUnitFollowUp, { ESCALONES } from './useUnitFollowUp'

/** Cuántas caben sin que la tarjeta se convierta en una lista que se ignora. */
const MAX_FILAS = 5

/**
 * Lo que le falta por mandar, en lo primero que abre.
 *
 * Medido el 17-sep-2026: se envía el 20% de lo que se genera, y las Directoras que no
 * envían nada entran a la app casi a diario — o sea que no es falta de alcance. El aviso
 * dentro de una sección no sirve para eso: para verlo hay que entrar a esa sección, y a la
 * que nunca usa no entra nunca. Aquí lo ve sin buscarlo.
 */
const UnitFollowUp = () => {
	const navigate = useNavigate()
	const { setFilters } = usePostsStore(state => state)
	const { loading, pendientes, enviadas, cobertura } = useUnitFollowUp()

	/* Sin pendientes no hay tarjeta: una que siempre está deja de leerse. */
	if (loading || !pendientes.length) return null

	const total = pendientes.reduce((suma, fila) => suma + fila.pendientes, 0)
	const visibles = pendientes.slice(0, MAX_FILAS)
	const resto = pendientes.length - visibles.length

	const faltan = cobertura ? Math.max(cobertura.people_count - cobertura.people_reached, 0) : 0
	const siguiente = cobertura ? ESCALONES.find(escalon => cobertura.percent < escalon.pct) : undefined

	const abrir = (section: string) => {
		setFilters({ post_type: MainPostSectionTypes.UNITY, section: section as PostSectionTypes })
		navigate(APP_ROUTES.POSTS.LIST)
	}

	return (
		<section className="overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-b from-primary/6 to-transparent">
			<header className="flex flex-wrap items-start gap-3 px-5 pt-4 pb-3.5">
				<span className="grid size-9.5 shrink-0 place-content-center rounded-xl bg-primary text-white">
					<SparklesIcon className="size-4.5" />
				</span>
				<div className="min-w-0 flex-1">
					<h2 className="text-[15px] font-extrabold tracking-tight">Su seguimiento de unidad</h2>
					<p className="text-[12.5px] text-muted-foreground">
						{cobertura && cobertura.people_count > 0
							? <>Ha llegado a <b className="font-bold text-foreground">{cobertura.people_reached}</b> de sus {cobertura.people_count} consultoras este mes.</>
							: 'Le preparé el contenido. Solo falta enviarlo.'}
					</p>
				</div>
				<div className="shrink-0 text-right">
					<p className="text-2xl leading-none font-extrabold text-primary">
						{cobertura && cobertura.people_count > 0 ? `${cobertura.percent}%` : total}
					</p>
					<p className="text-[10.5px] font-bold tracking-wide text-muted-foreground uppercase">
						{cobertura && cobertura.people_count > 0
							? 'de su unidad'
							: total === 1 ? 'pendiente' : 'pendientes'}
					</p>
				</div>
			</header>

			{cobertura && cobertura.people_count > 0 && (
				<div className="px-5 pb-4">
					{/* Barra de avance, nunca un semaforo: la mediana del padron esta en el 10% y
					    un color de alarma convierte la meta en una nota reprobatoria. */}
					<div className="h-2 overflow-hidden rounded-full bg-primary/10">
						<div
							className="h-full rounded-full bg-primary-gradient transition-[width] duration-500"
							style={{ width: `${Math.max(cobertura.percent, 2)}%` }}
						/>
					</div>

					<div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
						<p className="text-[12.5px] text-muted-foreground">
							{faltan > 0
								? <>Le faltan <b className="font-bold text-foreground">{faltan}</b> {faltan === 1 ? 'consultora' : 'consultoras'} por recibir algo suyo este mes.</>
								: <>No se le quedó nadie fuera este mes.</>}
						</p>
						{siguiente && (
							<p className="ml-auto text-[11.5px] font-semibold text-primary">
								Siguiente: {siguiente.nombre} · {siguiente.pct}%
							</p>
						)}
					</div>

					<ol className="mt-3 flex gap-1.5">
						{ESCALONES.map(escalon => {
							const logrado = cobertura.percent >= escalon.pct
							return (
								<li
									key={escalon.pct}
									className={cn(
										'flex-1 rounded-lg border px-2 py-1.5 text-center transition-colors',
										logrado ? 'border-primary/25 bg-primary/8' : 'border-dashed bg-transparent',
									)}
								>
									<p className={cn(
										'truncate text-[11px] font-bold',
										logrado ? 'text-primary' : 'text-muted-foreground/70',
									)}>
										{escalon.nombre}
									</p>
									<p className="text-[10px] font-semibold text-muted-foreground/60">{escalon.pct}%</p>
								</li>
							)
						})}
					</ol>
				</div>
			)}

			<ul className="bg-background">
				{visibles.map(fila => (
					<li
						key={fila.key}
						className="flex items-center gap-3 border-t px-5 py-2.5 transition-colors hover:bg-surface-soft"
					>
						<span className="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/8 [&_svg]:size-4 [&_svg]:text-primary">
							<IconBySection sectionKey={fila.key as PermissionKeys} />
						</span>

						<div className="min-w-0 flex-1">
							<p className="flex flex-wrap items-center gap-1.5 text-[13.5px] font-bold tracking-tight">
								{fila.label}
								{fila.hoy > 0 && (
									<span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-cyan-700 uppercase">
										Hoy
									</span>
								)}
								{fila.hoy === 0 && fila.virgen && (
									<span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 uppercase">
										Nunca enviada
									</span>
								)}
							</p>
							<p className="text-xs text-muted-foreground">
								{fila.hoy > 0
									? `${fila.hoy} ${fila.hoy === 1 ? 'celebra algo hoy' : 'celebran algo hoy'} · ${fila.pendientes} sin enviar`
									: `${fila.pendientes} ${fila.pendientes === 1 ? 'pieza lista' : 'piezas listas'} sin enviar`}
							</p>
						</div>

						<Button
							size="sm"
							variant={fila.hoy > 0 ? 'default' : 'outline'}
							onClick={() => abrir(fila.key)}
							className="shrink-0 rounded-lg text-xs font-semibold"
						>
							{fila.hoy > 0 ? 'Enviar' : 'Ver'}
						</Button>
					</li>
				))}
			</ul>

			<footer className="flex flex-wrap items-center gap-2 border-t bg-surface-soft px-5 py-2.5 text-xs text-muted-foreground">
				<span>
					{total} {total === 1 ? 'pieza pendiente' : 'piezas pendientes'}
					{enviadas > 0 && ` · este mes ha enviado ${enviadas}`}
				</span>
				{resto > 0 && (
					<span className="ml-auto">
						y {resto} {resto === 1 ? 'sección más' : 'secciones más'} con pendientes
					</span>
				)}
			</footer>
		</section>
	)
}

export default UnitFollowUp
