# 🧬 AZ-Genes | Decentralized Genomic Data Platform

Secure genomic data management powered by **Hedera Hashgraph**, **Supabase**, and **Next.js**.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)](https://supabase.com)
[![Hedera](https://img.shields.io/badge/Hedera-Mainnet-blue)](https://hedera.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

## 🚀 Features

- **Dual Authentication** - Email/password or Hedera wallet connection
- **Role-Based Access** - Patient, Doctor, and Researcher dashboards
- **Data Encryption** - End-to-end encrypted genomic data storage
- **NFT Certification** - Certify data ownership on Hedera
- **Access Control** - Grant and revoke data access with consent
- **Modern Stack** - Next.js 15, Supabase, Tailwind CSS v4

---

## � Prerequisites

- Node.js 18+
- [Supabase Account](https://supabase.com) (free tier available)
- [Resend Account](https://resend.com) (for email delivery)
- [WalletConnect Project ID](https://cloud.walletconnect.com) (for wallet auth)

---

## ⚡ Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/yourusername/az-genes.git
   cd az-genes
   npm install
   ```

2. **Environment Setup**
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   RESEND_API_KEY=your_resend_key
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_id
   ```

3. **Database Setup**
   
   Run in [Supabase SQL Editor](https://supabase.com/dashboard):
   ```sql
   -- See: supabase/migrations/01_simple_setup.sql
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **Supabase** | Authentication & PostgreSQL database |
| **Tailwind CSS v4** | Utility-first styling |
| **Hedera** | Blockchain for NFT certification |
| **Resend** | Transactional email delivery |
| **TypeScript** | Type-safe development |

---

## 📂 Project Structure

```
├── app/
│   ├── api/auth/          # Authentication endpoints
│   ├── dashboard/         # Role-specific dashboards
│   ├── sign-in/           # Login page
│   └── sign-up/           # Registration with OTP
├── components/
│   ├── auth/              # Auth UI components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── email.ts           # Email service
│   └── useAuth.ts         # Supabase auth hook
├── types/                 # TypeScript definitions
└── supabase/migrations/   # Database schema
```

---

## 🔐 Authentication

### Email/Password
1. Sign up with email → Receive OTP → Verify → Access dashboard
2. OTP expires in 10 minutes, resend available after 60 seconds
3. Rate limiting: 5 login attempts per hour

### Wallet Connection
1. Connect Hedera wallet (Blade/HashPack/Kabila)
2. First-time users: Select role & subscription tier
3. Returning users: Direct access to dashboard

---

## � Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel Dashboard](https://vercel.com)
3. Add environment variables
4. Deploy

### Environment Variables

Required for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_APP_URL` (your domain)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

Built with Next.js, Supabase, and Hedera Hashgraph

---

**Made with 🧬 by the AZ-Genes Team**
