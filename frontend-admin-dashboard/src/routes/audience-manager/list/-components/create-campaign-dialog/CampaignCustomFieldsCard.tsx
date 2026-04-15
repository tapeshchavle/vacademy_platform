import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { AudienceCampaignForm } from '../../-schema/AudienceCampaignSchema';
import { Sortable, SortableDragHandle, SortableItem } from '@/components/ui/sortable';
import { MyButton } from '@/components/design-system/button';
import { DotsSixVertical, Plus, TrashSimple } from '@phosphor-icons/react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
    AddCustomFieldDialog as SharedAddCustomFieldDialog,
    type DropdownOption,
    type CustomFieldConfig,
} from '@/components/common/custom-fields/AddCustomFieldDialog';
import { CustomFieldRenderer } from '@/components/common/custom-fields/CustomFieldRenderer';

/**
 * Props interface for Campaign Custom Fields Card
 * This component manages custom fields for campaign forms
 * Fields are dynamically loaded from settings cache and can be managed here
 */
interface CampaignCustomFieldsCardProps {
    form: UseFormReturn<AudienceCampaignForm>;
    updateFieldOrders: () => void;
    handleDeleteOpenField: (id: number) => void;
    toggleIsRequired: (id: number) => void;
    handleAddGender: (type: string, name: string, oldKey: boolean) => void;
    handleAddOpenFieldValues: (type: string, name: string, oldKey: boolean) => void;
    handleValueChange: (id: string, newValue: string) => void;
    handleEditClick: (id: number) => void;
    handleDeleteOptionField: (id: number) => void;
    handleAddDropdownOptions: () => void;
    handleCloseDialog: (
        type: string,
        name: string,
        oldKey: boolean,
        options?: { id: number; value: string; disabled: boolean }[],
        config?: Record<string, unknown>
    ) => void;
    handleAddPhoneNumber?: (type: string, name: string, oldKey: boolean) => void;
}

/**
 * Campaign Custom Fields Card Component
 * 
 * This component provides a UI for managing custom fields in campaign forms.
 * It displays fields loaded from settings (via getCampaignCustomFields) and
 * allows users to:
 * - View all custom fields (from settings + manually added)
 * - Reorder fields via drag-and-drop
 * - Toggle required status for non-permanent fields
 * - Add new fields (Gender, State, City, Phone Number, or custom)
 * - Delete non-permanent fields
 * - Preview the registration form
 * 
 * Fields are dynamically loaded from settings cache, so any changes made
 * in Custom Fields Settings will automatically reflect here.
 */
const CampaignCustomFieldsCard = ({
    form,
    updateFieldOrders,
    handleDeleteOpenField,
    toggleIsRequired,
    handleAddGender,
    handleAddOpenFieldValues,
    handleValueChange,
    handleEditClick,
    handleDeleteOptionField,
    handleAddDropdownOptions,
    handleCloseDialog,
    handleAddPhoneNumber,
}: CampaignCustomFieldsCardProps) => {
    const { control, getValues } = form;
    const { fields: customFieldsArray, move: moveCustomField } = useFieldArray({
        control,
        name: 'custom_fields',
    });
    const customFields = getValues('custom_fields');

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="flex flex-col text-lg font-semibold">
                    <span className="text-2xl font-bold">Customize Campaign Form</span>
                    <span className="text-sm text-gray-600">
                        Configure the fields students will fill out. Fields from settings are automatically loaded.
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex w-full flex-col gap-4">
                    {/* Sortable Fields List */}
                    <div className="flex flex-col gap-4">
                        <Sortable
                            value={customFieldsArray}
                            onMove={({ activeIndex, overIndex }) => {
                                moveCustomField(activeIndex, overIndex);
                                updateFieldOrders();
                            }}
                        >
                            <div className="flex flex-col gap-4">
                                {customFieldsArray
                                    .map((field, index) => {
                                        // Skip deleted fields from display
                                        if ((field as any).status === 'DELETED') {
                                            return null;
                                        }
                                        return (
                                            <SortableItem key={field.id} value={field.id} asChild>
                                                <div key={field.id} className="flex items-center gap-3">
                                                    <div className="flex min-w-0 flex-1 items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2">
                                                        <h1 className="text-sm">
                                                            {field.name}
                                                            {field.isRequired && (
                                                                <span className="text-subtitle text-danger-600">
                                                                    *
                                                                </span>
                                                            )}
                                                        </h1>
                                                        <div className="flex items-center gap-6">
                                                            {!field.oldKey && (
                                                                <MyButton
                                                                    type="button"
                                                                    scale="small"
                                                                    buttonType="secondary"
                                                                    className="min-w-6 !rounded-sm !p-0"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDeleteOpenField(index);
                                                                    }}
                                                                >
                                                                    <TrashSimple className="!size-4 text-danger-500" />
                                                                </MyButton>
                                                            )}
                                                            <SortableDragHandle
                                                                variant="ghost"
                                                                size="icon"
                                                                className="cursor-grab"
                                                            >
                                                                <DotsSixVertical size={20} />
                                                            </SortableDragHandle>
                                                        </div>
                                                    </div>
                                                    <h1 className="text-sm">Required</h1>
                                                    <Switch
                                                        checked={field.isRequired}
                                                        onCheckedChange={() => {
                                                            toggleIsRequired(index);
                                                        }}
                                                    />
                                                </div>
                                            </SortableItem>
                                        );
                                    })
                                    .filter(Boolean)}
                            </div>
                        </Sortable>
                    </div>

                    {/* Quick Add Buttons */}
                    <div className="mt-2 flex flex-wrap items-center gap-6">                     
                        {handleAddPhoneNumber &&
                            !customFields?.some((field) => field.name === 'Phone Number') && (
                                <MyButton
                                    type="button"
                                    scale="medium"
                                    buttonType="secondary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddPhoneNumber('textfield', 'Phone Number', false);
                                    }}
                                >
                                    <Plus size={32} /> Add Phone Number
                                </MyButton>
                            )}

                        {/* Add Custom Field Dialog */}
                        <SharedAddCustomFieldDialog
                            trigger={
                                <MyButton
                                    type="button"
                                    scale="medium"
                                    buttonType="secondary"
                                >
                                    <Plus size={32} /> Add Custom Field
                                </MyButton>
                            }
                            onAddField={(type, name, oldKey, options, config) =>
                                handleCloseDialog(type, name, oldKey, options, config as Record<string, unknown>)
                            }
                            existingFieldNames={
                                customFields
                                    ?.filter((f) => (f as any).status !== 'DELETED')
                                    .map((f) => f.name) ?? []
                            }
                        />
                    </div>

                    {/* Preview Dialog */}
                    <Dialog>
                        <DialogTrigger className="flex justify-start">
                            <MyButton
                                type="button"
                                scale="medium"
                                buttonType="secondary"
                                className="mt-4 w-fit"
                            >
                                Preview Registration Form
                            </MyButton>
                        </DialogTrigger>
                        <DialogContent className="flex max-h-[80vh] flex-col p-0">
                            <h1 className="shrink-0 rounded-md bg-primary-50 p-4 font-semibold text-primary-500">
                                Preview Registration Form
                            </h1>
                            <div className="flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
                                {customFields?.map((testInputFields, idx) => {
                                    const fieldConfig = (testInputFields as unknown as { config?: { defaultValue?: string; allowedFileTypes?: string[]; maxSizeMB?: number } }).config;
                                    const rendererOptions = testInputFields.options?.map((o) => o.value);
                                    return (
                                        <div className="flex flex-col items-start gap-4" key={idx}>
                                            <div className="flex w-full flex-col gap-[0.4rem]">
                                                <h1 className="mt-3 text-sm">
                                                    {testInputFields.name}
                                                    {testInputFields.isRequired && (
                                                        <span className="text-subtitle text-danger-600">
                                                            *
                                                        </span>
                                                    )}
                                                </h1>
                                                <CustomFieldRenderer
                                                    type={testInputFields.type}
                                                    name={testInputFields.name}
                                                    value=""
                                                    disabled={true}
                                                    options={rendererOptions}
                                                    config={fieldConfig}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
};

export default CampaignCustomFieldsCard;

