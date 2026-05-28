const ErrorText = ({ error }: { error: string }) => (
    <p role="alert" className="mt-1 text-xs text-left text-red-500 font-medium">
        {error}
    </p>
)

export default ErrorText
