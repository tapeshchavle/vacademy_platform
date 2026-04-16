import { AddCustomFieldDialog as SharedAddCustomFieldDialog } from '@/components/common/custom-fields/AddCustomFieldDialog';
import type { DropdownOption } from '@/components/common/custom-fields/AddCustomFieldDialog';
import { CustomField } from '../../-schema/InviteFormSchema';

export type { DropdownOption };

interface AddCustomFieldDialogProps {
    trigger: React.ReactNode;
    onAddField: (type: string, name: string, oldKey: boolean, options?: DropdownOption[]) => void;
    customFields: CustomField[];
}

export const AddCustomFieldDialog = ({
    trigger,
    onAddField,
    customFields,
}: AddCustomFieldDialogProps) => {
    const existingFieldNames = customFields.map((f) => f.name);

    return (
        <SharedAddCustomFieldDialog
            trigger={trigger}
            onAddField={(type, name, oldKey, options) => {
                onAddField(type, name, oldKey, options);
            }}
            existingFieldNames={existingFieldNames}
        />
    );
};
