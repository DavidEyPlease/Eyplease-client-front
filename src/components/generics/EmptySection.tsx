import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"

interface EmptySectionProps {
    media?: React.ReactNode;
    title: string;
    description: string;
    children?: React.ReactNode;
}

export function EmptySection({ media, title, description, children }: EmptySectionProps) {
    return (
        <Empty className="border border-dashed">
            <EmptyHeader>
                {media && <EmptyMedia>{media}</EmptyMedia>}
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>
                    {description}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                {children}
            </EmptyContent>
        </Empty>
    )
}
