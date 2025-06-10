# MTN MoMo SMS Analytics Frontend

A professional, responsive frontend dashboard for analyzing MTN Mobile Money (MoMo) SMS transaction data. Built with modern web technologies and following MTN brand guidelines.

## 🚀 Features

### Dashboard (index.html)
- **Summary Cards**: Total transactions, volume, monthly stats, and averages
- **Interactive Charts**: 
  - Transaction volume by type (horizontal bar chart)
  - Monthly transaction summary (combination line/column chart)
  - Payment distribution (donut chart)
- **Real-time Filtering**: Search and filter by type, date range, and amount
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Transactions List (transactions.html)
- **Advanced Search**: Real-time search across all transaction fields
- **Multi-criteria Filtering**: Filter by type, date range, amount, and status
- **Sortable Table**: Click column headers to sort data
- **Pagination**: Navigate through large datasets efficiently
- **Export Functionality**: Download filtered results as CSV
- **Responsive Design**: Mobile-optimized table with horizontal scrolling

### Transaction Detail (transaction.html)
- **Detailed View**: Complete transaction information display
- **Timeline Visualization**: Transaction processing steps
- **Related Transactions**: Find connected or similar transactions
- **Export Options**: Export individual transaction details
- **Breadcrumb Navigation**: Easy navigation back to listings

## 🎨 Design Features

### MTN Brand Colors
- **Primary Blue**: `#1E3A8A` (mtn-blue)
- **Success Green**: `#10B981` (mtn-green) 
- **Warning Yellow**: `#FFCB05` (mtn-yellow)

### UI Components
- Clean, professional card-based layout
- Consistent spacing and typography
- Smooth hover effects and transitions
- Accessible color contrasts
- Mobile-first responsive design

## 🛠 Technology Stack

- **HTML5**: Semantic markup for accessibility
- **Tailwind CSS**: Utility-first CSS framework (CDN)
- **Vanilla JavaScript**: ES6+ for all functionality
- **ApexCharts**: Interactive data visualizations (CDN)
- **Font Awesome**: Icon library for UI elements

## 📁 Project Structure

```
frontend/
├── index.html              # Dashboard page
├── transactions.html       # Transactions list
├── transaction.html        # Transaction detail
├── css/
│   └── styles.css         # Custom styles and animations
├── js/
│   ├── dashboard.js       # Dashboard functionality
│   ├── transactions.js    # Transaction list management
│   ├── transaction.js     # Transaction detail logic
│   └── utils.js          # Shared utility functions
├── data/
│   └── mock-data.js      # Sample transaction data
└── README.md             # This file
```

## 📊 Data Structure

The application uses mock transaction data with the following structure:

```javascript
{
  id: "123456",
  type: "incoming_money",
  amount: 5000,
  fee: 0,
  currency: "RWF",
  sender: "John Doe",
  receiver: null,
  timestamp: "2024-01-01T10:00:00",
  status: "completed"
}
```

### Transaction Types
- `incoming_money`: Money received
- `payment_to_code`: Payment using USSD code
- `payment_confirmation`: Payment confirmation
- `other`: Other transaction types

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Python, Node.js, or any HTTP server)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd momo-data-analysis/frontend
   ```

2. **Start a local web server**
   
   Using Python:
   ```bash
   python -m http.server 8080
   ```
   
   Using Node.js:
   ```bash
   npx serve -p 8080
   ```

3. **Open in browser**
   Navigate to `http://localhost:8080`

## 🎯 Key Functionality

### Dashboard Features
- **Animated Counters**: Summary cards with smooth number animations
- **Real-time Updates**: Charts update instantly when filters are applied
- **Local Storage**: User preferences are saved between sessions
- **Mobile Navigation**: Responsive hamburger menu for mobile devices

### Search & Filter
- **Debounced Search**: Optimized search with 300ms delay
- **Multiple Filters**: Combine search with type, date, and amount filters
- **URL Parameters**: Filter state preserved in browser URL
- **Reset Functionality**: Quick reset to clear all filters

### Data Export
- **CSV Format**: Export filtered data as comma-separated values
- **Custom Filename**: Exports include timestamp for organization
- **Header Row**: Includes column names for easy data processing

### Performance Optimizations
- **Lazy Loading**: Charts render only when needed
- **Efficient Filtering**: Optimized algorithms for large datasets
- **Caching**: Local storage for user preferences and settings
- **Responsive Images**: Optimized for different screen sizes

## 🔧 Customization

### Adding New Chart Types
1. Add chart configuration in `dashboard.js`
2. Create corresponding HTML container
3. Update the `renderCharts()` method

### Modifying Data Structure
1. Update `mock-data.js` with new fields
2. Modify utility functions in `utils.js`
3. Update display components in HTML files

### Styling Changes
1. Update custom Tailwind config in HTML files
2. Modify `styles.css` for additional custom styles
3. Update color variables for brand consistency

## 📱 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design optimized

## 🔒 Security Considerations

- No external API calls (runs locally)
- Local storage used only for user preferences
- No sensitive data transmission
- CSP-friendly implementation

## 🐛 Troubleshooting

### Common Issues

1. **Charts not rendering**
   - Ensure ApexCharts CDN is accessible
   - Check browser console for JavaScript errors
   - Verify data format matches expected structure

2. **Filters not working**
   - Clear browser cache and local storage
   - Check console for JavaScript errors
   - Verify mock data is loading correctly

3. **Mobile display issues**
   - Ensure viewport meta tag is present
   - Test with browser dev tools mobile view
   - Check Tailwind CSS CDN is loading

## 📈 Future Enhancements

- Real-time data integration with backend API
- Advanced analytics and reporting features
- User authentication and role-based access
- Data visualization customization options
- Bulk transaction operations
- Transaction status tracking
- Email/SMS notification system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across devices
5. Submit a pull request

## 📄 License

This project is developed for MTN MoMo analytics purposes. All rights reserved.

## 📞 Support

For technical support or questions about this frontend implementation, please contact the development team.

---

**Built with ❤️ for MTN MoMo Analytics**
