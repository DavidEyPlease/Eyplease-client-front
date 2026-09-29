const ErrorText = ({ error }: { error: string }) => (
    <p role="alert" className="mt-1.5 text-left text-[12.5px] font-semibold text-red-600 dark:text-red-400">
        {error}
    </p>
)

export default ErrorText
