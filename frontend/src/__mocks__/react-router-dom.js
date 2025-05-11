// Mock for react-router-dom
const mockNavigate = jest.fn();

module.exports = {
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useRouteMatch: () => ({ path: '/', url: '/' }),
  Outlet: () => <div data-testid="outlet">Protected Content</div>,
  Navigate: ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>,
  BrowserRouter: ({ children }) => <div>{children}</div>
};