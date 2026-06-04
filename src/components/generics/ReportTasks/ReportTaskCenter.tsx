import { downloadReportTask } from '@/services/reports/download'
import { ReportTask } from '@/services/reports/types'
import useReportTasksStore from '@/store/reportTasks'
import ReportTaskCard from './ReportTaskCard'

// Centro de tareas de generación de boletines: pila de toasts fija abajo-derecha,
// montada una sola vez en el layout. Lee el store global, así que las tarjetas
// siguen vivas y actualizándose aunque el usuario cambie de vista.
const ReportTaskCenter = () => {
    const tasks = useReportTasksStore(state => state.tasks)
    const removeTask = useReportTasksStore(state => state.removeTask)

    if (tasks.length === 0) return null

    const handleDownload = (task: ReportTask) => {
        if (task.download) downloadReportTask(task.download)
    }

    return (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex w-80 flex-col gap-3">
            {tasks.map(task => (
                <ReportTaskCard
                    key={task.id}
                    task={task}
                    onDownload={handleDownload}
                    onDismiss={removeTask}
                />
            ))}
        </div>
    )
}

export default ReportTaskCenter
