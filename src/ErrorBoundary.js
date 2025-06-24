import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#000000',
          color: '#ffffff', 
          borderRadius: '8px',
          margin: '20px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(106, 17, 203, 0.5)'
        }}>
          <h3 style={{ color: '#e755ba' }}>Something went wrong</h3>
          <p>There was an error in the application. This might be due to:</p>
          <ul style={{ 
            textAlign: 'left', 
            display: 'inline-block',
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            padding: '15px 30px',
            borderRadius: '8px'
          }}>
            <li>Application code issues</li>
            <li>Browser compatibility problems</li>
            <li>Resource loading failures</li>
          </ul>
          <p>Error details: {this.state.error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(to right, #6a11cb, #2575fc)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              cursor: 'pointer',
              marginTop: '20px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)'
            }}
          >
            Reload Page
          </button>
          
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'left',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              padding: '15px',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              <h4>Error Stack:</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 