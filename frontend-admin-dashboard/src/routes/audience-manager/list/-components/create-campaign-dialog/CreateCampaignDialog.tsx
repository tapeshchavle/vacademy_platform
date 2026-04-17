import React from 'react';
import { CreateCampaignForm } from './CreateCampaignForm';
import { CampaignItem } from '../../-services/get-campaigns-list';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getTerminology } from '@/components/common/layout-container/sidebar/utils';
import { OtherTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';

interface CreateCampaignDialogProps {
    isOpen: boolean;
    onClose: () => void;
    campaign?: CampaignItem | null;
}

export const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({
    isOpen,
    onClose,
    campaign,
}) => {
    const audienceListLabel = getTerminology(OtherTerms.AudienceList, SystemTerms.AudienceList);
    const heading = campaign ? `Edit ${audienceListLabel}` : `Create ${audienceListLabel}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                    <DialogTitle>{heading}</DialogTitle>
                </DialogHeader>
                <div className="min-w-0 overflow-hidden">
                    <CreateCampaignForm onSuccess={onClose} campaign={campaign} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
