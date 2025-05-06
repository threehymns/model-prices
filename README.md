<div align="center">
<h1> 📊 Model Prices </h1>

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://astro.build)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

## 🚀 Overview

Model Prices is an interactive dashboard for comparing and visualizing AI model pricing. Track and compare input/output costs across various AI models from different labs, helping you make informed decisions for your AI projects. This project is based on/inspired by Theo's model-prices.csv but aims to keep a more up-to-date list and remove outdated models.

## ✨ Features

- 📈 **Interactive Price Charts**: Visualize model pricing with dynamic, responsive charts
- 🔍 **Model Comparison**: Compare multiple AI models side-by-side
- 💰 **Cost Analysis**: View input, output, and combined pricing metrics
- 🧠 **Intelligence Metrics**: Compare price-to-performance with intelligence indices
- 🔄 **Real-time Updates**: Switch between models and instantly see updated charts
- 💎 **Value Calculation (needs work)**: See which models offer the best value for their capabilities

## 🖥️ Tech Stack

- **[Astro](https://astro.build)**: Fast, modern static site generator
- **[React](https://react.dev)**: UI component library
- **[TailwindCSS](https://tailwindcss.com)**: Utility-first CSS framework
- **[Recharts](https://recharts.org)**: Composable charting library
- **[Radix UI](https://www.radix-ui.com/)**: Unstyled, accessible UI components
- **[shadcn/ui](https://ui.shadcn.com/)**: Re-usable UI components

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/threehymns/model-prices.git
cd model-prices

# Install dependencies with pnpm
pnpm install

# Start the development server
pnpm dev
```

## 🚄 Quick Start

1. Run the development server: `pnpm dev`
2. Open [http://localhost:4321](http://localhost:4321) in your browser
3. Select models to compare in the table
4. View pricing data in the charts

## 📂 Project Structure

```
/
├── public/              # Static assets and data files
│   ├── model-prices.csv # AI model pricing data
│   └── labs.csv         # AI lab information
├── src/
│   ├── components/      # UI components
│   ├── hooks/           # Custom React hooks
│   ├── layouts/         # Page layouts
│   ├── lib/             # Utility functions
│   ├── pages/           # Astro pages
│   ├── stores/          # State management
│   └── styles/          # Global styles
└── package.json        # Project dependencies
```

## 📊 Data Sources

The application uses two main data sources:

- `public/model-prices.csv`: Contains pricing data for AI models, including input/output costs, release dates, and intelligence metrics
- `public/labs.csv`: Contains information about AI research labs and their models

## 🔄 Updating Data

To update model pricing data:

1. Edit the `public/model-prices.csv` file
2. Add or modify entries as needed
3. Restart the application if running

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- Inspired by/based on [code by Theo](https://model-prices.vercel.app/)
- [Artificial Analysis](https://artificialanalysis.ai) for the Intelligence Index
- Also thanks to [OpenRouter](https://openrouter.ai), [RooCode](https://roocode.com), [Coderabbit](https://coderabbit.ai), [Windsurf](https://windsurf.com), and [Zed](https://zed.dev) for free resources.

---

<div align="center">Made with ❤️ for the AI community</div>
