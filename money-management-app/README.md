# Money Management Web Application

A comprehensive money management web application built with React, TypeScript, and IndexedDB. This application helps you track your finances, manage multiple cards, categorize expenses, track loans, and analyze your financial data.

## Features

### 💳 Card Management
- Add, edit, and delete multiple cards
- Track balances for each card
- Support for multiple currencies (Rial, Dollar)
- Card-to-card transfers
- Visual card representation with colors

### 📊 Category Management
- Create custom expense categories
- Set optional budget limits for each category
- Visual category representation with icons and colors
- Budget utilization tracking

### 💰 Transaction Tracking
- Add income and expense transactions
- Manual transaction entry
- SMS parsing for automatic transaction creation
- Support for Iranian bank SMS formats
- Transaction filtering and search
- Multi-currency support

### 📱 SMS Parser
- Parse Iranian bank SMS messages
- Support for major Iranian banks (Melli, Mellat, Tejarat, Saman, Parsian)
- Automatic transaction type detection
- Extract amount, card number, and merchant information
- Ready for React Native integration

### 🏦 Loan Management
- Track multiple loans with payment schedules
- Calculate interest and payment amounts
- Payment schedule generation
- Payment tracking and status updates
- Loan progress visualization
- Overdue payment alerts

### 📈 Analytics & Charts
- Monthly income vs expenses trends
- Expense breakdown by category
- Budget utilization charts
- Financial summary statistics
- Interactive charts using Chart.js

### ⚙️ Settings & Configuration
- Multi-currency support
- Default currency selection
- Exchange rate management
- Currency addition and editing

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Database**: IndexedDB (via Dexie.js)
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Date Handling**: date-fns
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Modal.tsx
│   ├── Card.tsx
│   ├── DatePicker.tsx
│   └── Layout.tsx
├── pages/              # Main page components
│   ├── Dashboard.tsx
│   ├── Cards.tsx
│   ├── Categories.tsx
│   ├── Transactions.tsx
│   ├── Loans.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx
├── services/           # Business logic and data services
│   ├── database.ts
│   ├── index.ts
│   ├── smsParser.ts
│   └── loanCalculator.ts
├── types/              # TypeScript interfaces
│   └── index.ts
├── utils/              # Helper functions
├── App.tsx
├── main.tsx
└── index.css
```

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd money-management-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Initial Setup
1. **Add Cards**: Start by adding your bank cards with initial balances
2. **Create Categories**: Set up expense categories for better organization
3. **Configure Settings**: Set your default currency and add other currencies if needed

### Daily Usage
1. **Add Transactions**: Manually add income and expenses, or use SMS parsing
2. **Track Loans**: Add loans and track payment schedules
3. **Monitor Analytics**: Review your financial trends and budget utilization
4. **Transfer Money**: Move money between your cards

### SMS Parsing
1. Copy your bank SMS text
2. Go to Transactions page
3. Click "Parse SMS" button
4. Paste the SMS text
5. Review and confirm the parsed transaction

## Database Schema

The application uses IndexedDB with the following main entities:

- **Cards**: Card information and balances
- **Categories**: Expense categories with optional budgets
- **Transactions**: Income, expense, and transfer records
- **Loans**: Loan details and payment schedules
- **Settings**: App configuration and currency settings

## React Native Compatibility

The application is structured to be easily portable to React Native:

- Service layer is platform-agnostic
- SMS parser can be extended for native SMS access
- Database schema works with React Native storage solutions
- UI components can be replaced with React Native equivalents

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
