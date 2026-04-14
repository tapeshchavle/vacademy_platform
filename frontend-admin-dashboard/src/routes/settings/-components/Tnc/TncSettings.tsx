import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MyButton } from '@/components/design-system/button';
import { toast } from 'sonner';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { GET_INSITITUTE_SETTINGS } from '@/constants/urls';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import { FileUploader } from '@/routes/instructor-copilot/-components/FileUploader';
import { useFileUpload } from '@/hooks/use-file-upload';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface TncSettingsData {
    settingEnabled: boolean;
    fileMediaId: string | null;
    notifyOnSign: boolean;
    notifyEmails: string;
    prefillLearnerName: boolean;
}

const DEFAULT_TNC_SETTINGS: TncSettingsData = {
    settingEnabled: false,
    fileMediaId: null,
    notifyOnSign: false,
    notifyEmails: '',
    prefillLearnerName: false,
};

const SETTING_KEY = 'STUDENT_TNC_SETTING';
const SAVE_URL = GET_INSITITUTE_SETTINGS.replace('/get', '/save-setting');

const fetchTncSettings = async (): Promise<TncSettingsData> => {
    const instituteId = getCurrentInstituteId();
    const response = await authenticatedAxiosInstance({
        method: 'GET',
        url: GET_INSITITUTE_SETTINGS,
        params: { instituteId, settingKey: SETTING_KEY },
    });
    // Merge with defaults so new fields (notifyOnSign, notifyEmails) are always present
    return { ...DEFAULT_TNC_SETTINGS, ...(response.data?.data ?? {}) };
};

const saveTncSettings = async (data: TncSettingsData): Promise<void> => {
    const instituteId = getCurrentInstituteId();
    await authenticatedAxiosInstance.post(
        SAVE_URL,
        { setting_name: 'Student T&C', setting_data: data },
        { params: { instituteId, settingKey: SETTING_KEY } }
    );
};

export default function TncSettings() {
    const queryClient = useQueryClient();
    const { currentUser } = useCurrentUser();
    const { uploadFile, getPublicUrl } = useFileUpload();
    const [settings, setSettings] = useState<TncSettingsData>(DEFAULT_TNC_SETTINGS);
    const [hasChanges, setHasChanges] = useState(false);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['tnc-settings'],
        queryFn: fetchTncSettings,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (data) {
            setSettings(data);
            setHasChanges(false);
            if (data.fileMediaId) {
                getPublicUrl(data.fileMediaId).then((res: any) => {
                    const urlStr = typeof res === 'string' ? res : res?.data;
                    if (urlStr) setFileUrl(urlStr);
                }).catch(console.error);
            }
        }
    }, [data, getPublicUrl]);

    const { mutate: save, isPending: saving } = useMutation({
        mutationFn: saveTncSettings,
        onSuccess: () => {
            toast.success('Terms & Conditions settings saved');
            setHasChanges(false);
            queryClient.invalidateQueries({ queryKey: ['tnc-settings'] });
        },
        onError: () => {
            toast.error('Failed to save T&C settings');
        },
    });

    const update = (patch: Partial<TncSettingsData>) => {
        setSettings((prev) => ({ ...prev, ...patch }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (settings.settingEnabled && !settings.fileMediaId) {
            toast.error('Please upload a PDF file to enable Terms & Conditions');
            return;
        }
        if (settings.notifyOnSign && !settings.notifyEmails.trim()) {
            toast.error('Please enter at least one recipient email for notifications');
            return;
        }
        save(settings);
    };

    const handleFileSelected = async (file: File) => {
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are supported');
            return;
        }
        
        try {
            await uploadFile({
                file,
                setIsUploading: setIsUploadingMedia,
                userId: currentUser?.id || 'admin',
                publicUrl: true,
            }).then((uploadRes: any) => {
                 const fileId = uploadRes.id || uploadRes;
                 update({ fileMediaId: fileId });
                 getPublicUrl(fileId).then((res: any) => {
                     const urlStr = typeof res === 'string' ? res : res?.data;
                     if (urlStr) setFileUrl(urlStr);
                 });
                 toast.success('PDF uploaded successfully');
            });
        } catch (error) {
            toast.error('Failed to upload PDF file');
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="p-6 text-sm text-muted-foreground">Loading T&C settings...</div>;
    }

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Student Terms & Conditions</CardTitle>
                    <CardDescription>
                        Enable Terms & Conditions to require learners to digitally sign the agreement
                        before they can access their dashboard content.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex items-center gap-3">
                        <Switch
                            id="tnc-enabled"
                            checked={settings.settingEnabled}
                            onCheckedChange={(v) => update({ settingEnabled: v })}
                        />
                        <Label htmlFor="tnc-enabled" className="cursor-pointer">
                            {settings.settingEnabled ? 'Enabled' : 'Disabled'}
                        </Label>
                    </div>

                    <div className="space-y-4">
                        <Label>Terms and Conditions PDF</Label>
                        <p className="text-sm text-muted-foreground">
                            Upload the base PDF document. When a learner accepts it, their name and date will be appended as a new page.
                        </p>
                        
                        {settings.fileMediaId && fileUrl ? (
                            <div className="flex flex-col gap-2 rounded-md border p-4 bg-muted/20">
                                <span className="text-sm font-medium">Currently Uploaded PDF</span>
                                <div className="flex items-center gap-4">
                                     <a href={fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm truncate flex-1">
                                        View T&C Document
                                     </a>
                                     <MyButton buttonType="secondary" scale="small" onClick={() => {
                                         update({ fileMediaId: null });
                                         setFileUrl(null);
                                     }}>
                                         Remove
                                     </MyButton>
                                </div>
                            </div>
                        ) : (
                            <FileUploader 
                                onFileSelected={handleFileSelected} 
                                maxSize={10} 
                                acceptFormats={{ 'application/pdf': ['.pdf'] }}
                                acceptMsg="Supported format: PDF"
                            />
                        )}
                        {isUploadingMedia && <p className="text-xs text-primary">Uploading PDF...</p>}
                    </div>

                    <div className="space-y-3 pt-2">
                        <Label>Learner Name on Signature</Label>
                        <p className="text-sm text-muted-foreground">
                            Choose how the learner's name is captured when they sign the Terms & Conditions.
                        </p>
                        <div className="flex items-start gap-3 rounded-md border p-4">
                            <Switch
                                id="tnc-prefill-name"
                                checked={settings.prefillLearnerName}
                                onCheckedChange={(v) => update({ prefillLearnerName: v })}
                                className="mt-0.5"
                            />
                            <div className="space-y-1">
                                <Label htmlFor="tnc-prefill-name" className="cursor-pointer">
                                    Prefill learner's name (non-editable)
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    {settings.prefillLearnerName
                                        ? "The learner's registered name will be auto-filled and locked on the signature field."
                                        : 'The learner will be required to type their full name manually when signing.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notify on Sign</CardTitle>
                    <CardDescription>
                        Send an email notification with the signed PDF link whenever a student accepts the Terms &amp; Conditions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Switch
                            id="notify-on-sign"
                            checked={settings.notifyOnSign}
                            onCheckedChange={(v) => update({ notifyOnSign: v })}
                        />
                        <Label htmlFor="notify-on-sign" className="cursor-pointer">
                            {settings.notifyOnSign ? 'Enabled' : 'Disabled'}
                        </Label>
                    </div>

                    {settings.notifyOnSign && (
                        <div className="space-y-2">
                            <Label htmlFor="notify-emails">Recipient Emails</Label>
                            <Input
                                id="notify-emails"
                                placeholder="admin@example.com, hr@example.com"
                                value={settings.notifyEmails}
                                onChange={(e) => update({ notifyEmails: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Separate multiple email addresses with commas. Each address will receive the signed PDF link.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <MyButton
                    buttonType="primary"
                    scale="medium"
                    onClick={handleSave}
                    disable={saving || !hasChanges || isUploadingMedia}
                >
                    {saving ? 'Saving...' : 'Save Settings'}
                </MyButton>
            </div>
        </div>
    );
}
