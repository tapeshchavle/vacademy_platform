import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { MyButton } from '@/components/design-system/button';
import { toast } from 'sonner';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import { Copy, Check, ArrowSquareOut } from '@phosphor-icons/react';
import {
    initiateMetaOAuth,
    getSessionPages,
    saveMetaConnector,
    saveGoogleConnector,
    type MetaPage,
} from '../-services/ad-platform-service';

// ── Google Connector Card ─────────────────────────────────────────────────────

function GoogleConnectorCard() {
    const [googleKey, setGoogleKey] = useState('');
    const [audienceId, setAudienceId] = useState('');
    const [copied, setCopied] = useState(false);

    const instituteId = getCurrentInstituteId() ?? '';
    const webhookUrl = googleKey
        ? `${window.location.origin}/admin-core-service/api/v1/webhook/google/${googleKey}`
        : '';

    const { mutate: save, isPending } = useMutation({
        mutationFn: () =>
            saveGoogleConnector({
                vendor: 'GOOGLE_LEAD_ADS',
                instituteId,
                audienceId,
                googleKey,
                platformFormId: googleKey,
                producesSourceType: 'GOOGLE_ADS',
            }),
        onSuccess: (result) => {
            toast.success(result.message);
            setGoogleKey('');
        },
        onError: () => toast.error('Failed to save Google connector'),
    });

    const copyUrl = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="size-6 rounded bg-blue-100 text-center text-sm font-bold text-blue-700">
                        G
                    </span>
                    Google Lead Form Extensions
                </CardTitle>
                <CardDescription>
                    Connect Google Ads Lead Form Extensions. Leads are sent to your audience
                    automatically via a webhook URL you paste in Google Ads.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Google Key</Label>
                    <p className="text-xs text-muted-foreground">
                        A unique identifier for this connection. Use any secure random string.
                    </p>
                    <Input
                        placeholder="e.g. my-institute-leads-abc123"
                        value={googleKey}
                        onChange={(e) => setGoogleKey(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Audience ID</Label>
                    <p className="text-xs text-muted-foreground">
                        The audience/campaign where leads will be added.
                    </p>
                    <Input
                        placeholder="Paste audience UUID"
                        value={audienceId}
                        onChange={(e) => setAudienceId(e.target.value)}
                    />
                </div>

                {webhookUrl && (
                    <div className="space-y-1">
                        <Label>Webhook URL</Label>
                        <div className="flex items-center gap-2 rounded-md border bg-neutral-50 px-3 py-2">
                            <code className="flex-1 truncate text-xs">{webhookUrl}</code>
                            <button
                                onClick={copyUrl}
                                className="shrink-0 text-neutral-500 hover:text-neutral-700"
                            >
                                {copied ? (
                                    <Check className="size-4 text-green-600" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Paste this URL and the Google Key into your Google Ads Lead Form
                            Extension webhook settings.
                        </p>
                    </div>
                )}

                <MyButton
                    buttonType="primary"
                    scale="small"
                    onClick={() => save()}
                    disable={isPending || !googleKey || !audienceId}
                >
                    {isPending ? 'Saving...' : 'Save Google Connector'}
                </MyButton>
            </CardContent>
        </Card>
    );
}

// ── Meta Connector Card ──────────────────────────────────────────────────────

function MetaConnectorCard({ sessionKeyFromUrl }: { sessionKeyFromUrl?: string }) {
    const instituteId = getCurrentInstituteId() ?? '';
    const [sessionKey, setSessionKey] = useState(sessionKeyFromUrl || '');
    const [selectedPageId, setSelectedPageId] = useState('');
    const [formId, setFormId] = useState('');
    const [audienceId, setAudienceId] = useState('');
    const [sourceType, setSourceType] = useState<'FACEBOOK_ADS' | 'INSTAGRAM_ADS'>('FACEBOOK_ADS');

    // Sync from URL param
    useEffect(() => {
        if (sessionKeyFromUrl) setSessionKey(sessionKeyFromUrl);
    }, [sessionKeyFromUrl]);

    // Fetch pages when session key is available
    const {
        data: pages,
        isLoading: loadingPages,
        error: pagesError,
    } = useQuery({
        queryKey: ['meta-pages', sessionKey],
        queryFn: () => getSessionPages(sessionKey),
        enabled: !!sessionKey,
        retry: false,
    });

    const { mutate: initOAuth, isPending: initiating } = useMutation({
        mutationFn: () => initiateMetaOAuth(instituteId, audienceId || undefined),
        onSuccess: (data) => {
            // Redirect browser to Meta OAuth consent screen
            window.location.href = data.oauth_url;
        },
        onError: () => toast.error('Failed to start Meta OAuth'),
    });

    const { mutate: saveConnector, isPending: saving } = useMutation({
        mutationFn: () =>
            saveMetaConnector({
                vendor: 'META_LEAD_ADS',
                instituteId,
                audienceId,
                sessionKey,
                selectedPageId,
                platformFormId: formId,
                producesSourceType: sourceType,
                platformPageId: selectedPageId,
            }),
        onSuccess: (result) => {
            toast.success(result.message);
            setSessionKey('');
            setSelectedPageId('');
            setFormId('');
        },
        onError: () => toast.error('Failed to save Meta connector'),
    });

    const isAuthorized = !!sessionKey && !!pages && pages.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="size-6 rounded bg-blue-600 text-center text-sm font-bold text-white">
                        f
                    </span>
                    Meta Lead Ads (Facebook + Instagram)
                </CardTitle>
                <CardDescription>
                    Connect your Facebook Business Page to automatically receive leads from Facebook
                    and Instagram Lead Ads.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Step 1: Connect */}
                {!isAuthorized && (
                    <>
                        <div className="space-y-2">
                            <Label>Audience ID (optional)</Label>
                            <p className="text-xs text-muted-foreground">
                                Pre-select the audience to send leads to. You can change this after
                                connecting.
                            </p>
                            <Input
                                placeholder="Paste audience UUID (optional)"
                                value={audienceId}
                                onChange={(e) => setAudienceId(e.target.value)}
                            />
                        </div>

                        {pagesError && (
                            <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                Session expired or invalid. Please reconnect.
                            </div>
                        )}

                        <MyButton
                            buttonType="primary"
                            scale="small"
                            onClick={() => initOAuth()}
                            disable={initiating}
                        >
                            <ArrowSquareOut className="size-4" />
                            {initiating ? 'Redirecting...' : 'Connect Meta Account'}
                        </MyButton>
                    </>
                )}

                {/* Step 2: Select page */}
                {loadingPages && sessionKey && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="size-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                        Loading pages...
                    </div>
                )}

                {isAuthorized && (
                    <>
                        <div className="rounded-md border border-green-100 bg-green-50 p-3 text-sm text-green-700">
                            Meta account connected. Select a page and form below.
                        </div>

                        <div className="space-y-2">
                            <Label>Facebook Page</Label>
                            <select
                                className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                                value={selectedPageId}
                                onChange={(e) => setSelectedPageId(e.target.value)}
                            >
                                <option value="">Select a page...</option>
                                {pages.map((p: MetaPage) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Lead Gen Form ID</Label>
                            <p className="text-xs text-muted-foreground">
                                The Facebook Lead Gen Form ID. Find this in Meta Ads Manager under
                                your campaign&apos;s lead form settings.
                            </p>
                            <Input
                                placeholder="e.g. 123456789012345"
                                value={formId}
                                onChange={(e) => setFormId(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Audience ID</Label>
                            <Input
                                placeholder="Paste audience UUID"
                                value={audienceId}
                                onChange={(e) => setAudienceId(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Source Type</Label>
                            <div className="flex gap-3">
                                {(['FACEBOOK_ADS', 'INSTAGRAM_ADS'] as const).map((t) => (
                                    <label
                                        key={t}
                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                    >
                                        <input
                                            type="radio"
                                            name="sourceType"
                                            checked={sourceType === t}
                                            onChange={() => setSourceType(t)}
                                        />
                                        {t === 'FACEBOOK_ADS' ? 'Facebook Ads' : 'Instagram Ads'}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <MyButton
                            buttonType="primary"
                            scale="small"
                            onClick={() => saveConnector()}
                            disable={saving || !selectedPageId || !formId || !audienceId}
                        >
                            {saving ? 'Saving...' : 'Save Meta Connector'}
                        </MyButton>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ── Main Integrations Page ───────────────────────────────────────────────────

export default function IntegrationSettings() {
    // Check for session_key in URL (set by Meta OAuth callback redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionKeyFromUrl = urlParams.get('session_key') || undefined;
    const oauthError = urlParams.get('error');

    useEffect(() => {
        if (oauthError) {
            toast.error(`Meta OAuth failed: ${oauthError}`);
        }
        if (sessionKeyFromUrl) {
            toast.success('Meta account connected successfully');
        }
        // Clean transient OAuth params from URL so refresh doesn't replay them
        if (sessionKeyFromUrl || oauthError) {
            const clean = new URL(window.location.href);
            clean.searchParams.delete('session_key');
            clean.searchParams.delete('error');
            window.history.replaceState({}, '', clean.toString());
        }
    }, [oauthError, sessionKeyFromUrl]);

    return (
        <div className="space-y-6 p-6">
            <div>
                <h2 className="text-lg font-semibold">Ad Platform Integrations</h2>
                <p className="text-sm text-muted-foreground">
                    Connect Google Ads and Meta (Facebook/Instagram) Lead Ads to automatically
                    capture leads into your audiences.
                </p>
            </div>

            <Separator />

            <MetaConnectorCard sessionKeyFromUrl={sessionKeyFromUrl} />
            <GoogleConnectorCard />
        </div>
    );
}
