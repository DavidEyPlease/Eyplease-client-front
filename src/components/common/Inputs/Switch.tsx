import { forwardRef } from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SwitchInputProps } from "./types";
import { Badge } from "@/components/ui/badge";
import Spinner from "../Spinner";

const SwitchInput = forwardRef<HTMLButtonElement, SwitchInputProps>(({
    id,
    label,
    badge,
    loading,
    ...props
}, ref) => {
    return (
        <div className="flex items-center space-x-2">
            <Switch id={id} ref={ref} {...props} disabled={loading || props.disabled} />
            {label && <Label htmlFor="airplane-mode">{label}</Label>}
            {badge && <Badge variant={props.checked ? "default" : "secondary"} className="gap-x-2">
                {props.checked ? "Activo" : "Inactivo"}
                {loading && <Spinner size="xs" color="primary" />}
            </Badge>}
        </div>
    )
});

export default SwitchInput;