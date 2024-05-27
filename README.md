# AI Accounting Agent

An AI-powered accounting assistant that uses natural language (and voice) to manage accounts and taxes for small businesses by integrating with popular accounting software.

## Features

- Natural language processing for accounting commands
- Voice command support using OpenAI's Whisper
- Integration with QuickBooks (extensible to other accounting software)
- Real-time transaction processing and categorization
- Automated tax calculations and reporting
- Comprehensive financial reporting
- Secure authentication and data handling

## Project Structure

```
/accounting-agent
├── packages/
│   ├── backend/           # Node.js/Express backend
│   │   ├── src/
│   │   │   ├── config/   # Configuration
│   │   │   ├── routes/   # API routes
│   │   │   ├── services/ # Business logic
│   │   │   ├── utils/    # Utilities
│   │   │   └── index.ts  # Entry point
│   │   └── package.json
│   └── shared/           # Shared types and utilities
│       ├── src/
│       │   ├── types/    # TypeScript types
│       │   └── index.ts  # Entry point
│       └── package.json
└── package.json          # Root package.json
```

## Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- OpenAI API key
- QuickBooks Developer account and API credentials

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/accounting-agent.git
   cd accounting-agent
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Create environment files:
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   ```

4. Configure environment variables:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_api_key
   OPENAI_MODEL=gpt-4
   
   # QuickBooks Configuration
   QUICKBOOKS_CLIENT_ID=your_client_id
   QUICKBOOKS_CLIENT_SECRET=your_client_secret
   QUICKBOOKS_REDIRECT_URI=http://localhost:3000/callback
   QUICKBOOKS_ENVIRONMENT=sandbox
   ```

5. Build packages:
   ```bash
   yarn build
   ```

## Development

Start the development server:
```bash
yarn dev
```

Run tests:
```bash
yarn test
```

Run linting:
```bash
yarn lint
```

Type checking:
```bash
yarn typecheck
```

## API Documentation

The API documentation is available at `http://localhost:3000/api/docs` when running the development server.

### Key Endpoints

- `POST /api/command` - Process natural language commands
- `POST /api/voice` - Process voice commands
- `GET /api/suggestions` - Get command suggestions
- `GET /api/transactions` - Get transaction history
- `GET /api/reports` - Generate financial reports

## Voice Commands

Example voice commands:
- "Show me my account balance"
- "Create a new transaction for $50 for office supplies"
- "Generate a profit and loss report for last month"
- "What's my tax liability for this quarter?"

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
