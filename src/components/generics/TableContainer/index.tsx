import { TableColumn } from "@/interfaces/common"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCaption,
    // TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Props {
    children: React.ReactNode
    caption?: string
    columns: TableColumn[]
}

const TableContainer = ({ children, columns, caption }: Props) => {
    return (
        <Card className="w-full rounded-2xl">
            <CardContent>
                <Table>
                    {caption && <TableCaption>{caption}</TableCaption>}
                    <TableHeader>
                        <TableRow>
                            {columns.map(column => (<TableHead key={column.key}>{column.label}</TableHead>))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {children}
                    </TableBody>
                    {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
                </Table>
            </CardContent>
        </Card>
    )
}

export default TableContainer