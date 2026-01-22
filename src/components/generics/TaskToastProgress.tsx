import { cn } from "@/lib/utils"
import { TypographySmall } from "../common/Typography"
import { useTaskProgressStore } from "@/store/task-progress"
import Spinner from "../common/Spinner"

const TaskToastProgress = () => {
    const { taskProgressText } = useTaskProgressStore(state => state)

    if (!taskProgressText) return null

    return (
        <div className={cn("fixed min-w-xs z-[9999] space-y-3 bottom-5 right-5 px-4 py-4 rounded-md bg-primary shadow-lg animate-fade-right")}>
            <div className="flex items-end gap-x-2">
                <div className="flex gap-x-4 items-end">
                    <Spinner className="w-max" />
                    <TypographySmall text={taskProgressText} className="text-white font-semibold" />
                </div>
                <div className='flex space-x-1 justify-center items-end'>
                    <span className='sr-only'>Loading...</span>
                    <div className='size-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                    <div className='size-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                    <div className='size-1 bg-white rounded-full animate-bounce'></div>
                </div>
            </div>
        </div>
    )
}

export default TaskToastProgress
