/**
 * client.ts
 * IPFS Service using Pinata
 */

export interface PinataResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
}

export class IPFSClient {
    private apiKey: string;
    private apiSecret: string;
    private jwt?: string;

    constructor() {
        this.apiKey = process.env.PINATA_API_KEY || '';
        this.apiSecret = process.env.PINATA_API_SECRET || '';
        this.jwt = process.env.PINATA_JWT || '';
    }

    /**
     * Uploads a file (Buffer) to IPFS via Pinata
     */
    async uploadFile(fileBuffer: Buffer, fileName: string): Promise<string> {
        if (!this.jwt && (!this.apiKey || !this.apiSecret)) {
            throw new Error('Pinata API credentials not configured');
        }

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(fileBuffer)]);
        formData.append('file', blob, fileName);

        const pinataMetadata = JSON.stringify({
            name: fileName,
        });
        formData.append('pinataMetadata', pinataMetadata);

        const pinataOptions = JSON.stringify({
            cidVersion: 1,
        });
        formData.append('pinataOptions', pinataOptions);

        const headers: Record<string, string> = {};
        if (this.jwt) {
            headers['Authorization'] = `Bearer ${this.jwt}`;
        } else {
            headers['pinata_api_key'] = this.apiKey;
            headers['pinata_secret_api_key'] = this.apiSecret;
        }

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pinata upload failed: ${response.statusText} - ${errorText}`);
        }

        const data: PinataResponse = await response.json();
        return data.IpfsHash;
    }

    /**
     * Generates a gateway URL for a CID
     */
    getGatewayUrl(cid: string): string {
        const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
        return `${gateway}${cid}`;
    }
}
