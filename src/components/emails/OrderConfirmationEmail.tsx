import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OrderItemSummary {
  productTitle: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: OrderItemSummary[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  finalTotal: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: string;
  city?: string;
  state?: string;
  postalCode?: string;
  storeName?: string;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber = "FF-DEMO-001",
  customerName = "Valued Customer",
  items = [],
  subtotal = 0,
  discountTotal = 0,
  shippingFee = 0,
  finalTotal = 0,
  paymentMethod = "Razorpay",
  paymentStatus = "CONFIRMED",
  shippingAddress = "",
  city = "",
  state = "",
  postalCode = "",
  storeName = "M.E-Commerce",
}) => {
  return (
    <Html>
      <Head />
      <Preview>Order Confirmed: {orderNumber} - {storeName}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Text style={brandBadgeStyle}>{storeName.toUpperCase()} STUDIO</Text>
            <Heading style={headingStyle}>Order Confirmed</Heading>
            <Text style={orderNumStyle}>Order #{orderNumber}</Text>
          </Section>

          {/* Greeting */}
          <Section style={contentSectionStyle}>
            <Text style={greetingTextStyle}>
              Dear {customerName},
            </Text>
            <Text style={bodyTextStyle}>
              Thank you for choosing our handcrafted studio creations! Your order has been registered and is being prepared with thoughtful artisan care.
            </Text>
          </Section>

          {/* Status Badge */}
          <Section style={badgeContainerStyle}>
            <Text style={badgeTextStyle}>
              Payment Mode: <strong>{paymentMethod.replace("_", " ")}</strong> &bull; Status:{" "}
              <strong>{paymentStatus}</strong>
            </Text>
          </Section>

          {/* Items Table */}
          <Section style={tableContainerStyle}>
            <Text style={sectionTitleStyle}>Ordered Items</Text>
            {items.map((item, idx) => (
              <div key={idx} style={itemRowStyle}>
                <div style={itemDetailsStyle}>
                  <Text style={itemTitleStyle}>{item.productTitle}</Text>
                  <Text style={itemQuantityStyle}>Qty: {item.quantity}</Text>
                </div>
                <Text style={itemPriceStyle}>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </Text>
              </div>
            ))}

            <Hr style={subHrStyle} />

            {/* Price Calculations */}
            <div style={summaryRowStyle}>
              <Text style={summaryLabelStyle}>Subtotal</Text>
              <Text style={summaryValueStyle}>₹{subtotal.toLocaleString("en-IN")}</Text>
            </div>
            {discountTotal > 0 && (
              <div style={summaryRowStyle}>
                <Text style={summaryLabelStyle}>Discount Applied</Text>
                <Text style={discountValueStyle}>-₹{discountTotal.toLocaleString("en-IN")}</Text>
              </div>
            )}
            <div style={summaryRowStyle}>
              <Text style={summaryLabelStyle}>Shipping</Text>
              <Text style={summaryValueStyle}>
                {shippingFee === 0 ? "Free Shipping" : `₹${shippingFee.toLocaleString("en-IN")}`}
              </Text>
            </div>
            <div style={summaryRowBoldStyle}>
              <Text style={totalLabelStyle}>Total Paid / Payable</Text>
              <Text style={totalValueStyle}>₹{finalTotal.toLocaleString("en-IN")}</Text>
            </div>
          </Section>

          {/* Shipping Address */}
          <Section style={addressSectionStyle}>
            <Text style={sectionTitleStyle}>Shipping Destination</Text>
            <Text style={addressTextStyle}>
              {shippingAddress}
              {city && `, ${city}`}
              {state && `, ${state}`}
              {postalCode && ` - ${postalCode}`}
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              © {new Date().getFullYear()} {storeName}. Handcrafted with passion.
            </Text>
            <Text style={footerSubtextStyle}>
              Questions about your delivery? Reach out to our concierge support team.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

const mainStyle: React.CSSProperties = {
  backgroundColor: "#f5f2eb",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "36px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e7dfd3",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "580px",
  padding: "36px 32px",
  boxShadow: "0 4px 18px rgba(0, 0, 0, 0.04)",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const brandBadgeStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.22em",
  color: "#944434",
  fontWeight: 700,
  margin: "0 0 6px 0",
};

const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#181513",
  margin: "0 0 4px 0",
};

const orderNumStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#786f64",
  margin: "0",
  fontFamily: "monospace",
};

const contentSectionStyle: React.CSSProperties = {
  margin: "16px 0",
};

const greetingTextStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#3d3630",
  margin: "0 0 8px 0",
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#524a42",
  lineHeight: "1.6",
  margin: "0",
};

const badgeContainerStyle: React.CSSProperties = {
  backgroundColor: "#faf7f2",
  border: "1px solid #ded5c6",
  borderRadius: "8px",
  padding: "10px 16px",
  margin: "18px 0",
};

const badgeTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#524a42",
  margin: "0",
  textAlign: "center",
};

const tableContainerStyle: React.CSSProperties = {
  margin: "24px 0",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: 700,
  color: "#786f64",
  margin: "0 0 12px 0",
};

const itemRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "8px 0",
};

const itemDetailsStyle: React.CSSProperties = {
  flex: "1",
};

const itemTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#181513",
  margin: "0",
};

const itemQuantityStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#786f64",
  margin: "2px 0 0 0",
};

const itemPriceStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#181513",
  margin: "0",
};

const subHrStyle: React.CSSProperties = {
  borderColor: "#efebe4",
  margin: "14px 0",
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "3px 0",
};

const summaryRowBoldStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0 0 0",
  marginTop: "6px",
  borderTop: "1px dashed #ded5c6",
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#786f64",
  margin: "0",
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#181513",
  margin: "0",
};

const discountValueStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#16a34a",
  margin: "0",
};

const totalLabelStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#181513",
  margin: "0",
};

const totalValueStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 800,
  color: "#944434",
  margin: "0",
};

const addressSectionStyle: React.CSSProperties = {
  backgroundColor: "#faf7f2",
  borderRadius: "8px",
  padding: "14px 16px",
  margin: "20px 0",
};

const addressTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#524a42",
  margin: "0",
  lineHeight: "1.5",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#eae3d6",
  margin: "28px 0 20px 0",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
};

const footerTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#857b6f",
  margin: "0 0 4px 0",
};

const footerSubtextStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#a4998c",
  margin: "0",
};
