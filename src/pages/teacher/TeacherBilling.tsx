import {
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "@/components/reusable/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CheckoutButton from "./components/CheckoutButton";
import clsx from "clsx";

/** Types */
type Invoice = {
  id: string;
  date: string; // ISO or yyyy-mm-dd
  amount: string; // display amount
  status: "Paid" | "Open" | "Past Due";
  description: string;
};

type UsageStat = {
  label: string;
  current: number;
  limit: number | "Unlimited";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "primary" | "accent" | "muted";
};

type SubscriptionData = {
  plan: string | null;
  status: "Active" | "Inactive" | "Trialing" | "Canceled" | "Past Due";
  nextBilling: string | null; // ISO
  amount: string; // "$49.99"
  students: number | "Unlimited";
  assessments: number | "Unlimited" | string;
};

/** Helpers */
const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(dt);
  } catch {
    return d;
  }
};

const badgeForInvoice = (status: Invoice["status"]) =>
  clsx(
    "px-2 py-0.5 rounded-full text-xs",
    status === "Paid" && "bg-primary/20 text-primary",
    status === "Open" && "bg-yellow-500/15 text-yellow-600",
    status === "Past Due" && "bg-destructive/20 text-destructive"
  );

const textColor = (tone: UsageStat["color"]) =>
  ({
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-muted-foreground",
  }[tone]);

const barColor = (tone: UsageStat["color"]) =>
  ({
    primary: "bg-primary",
    accent: "bg-accent",
    muted: "bg-muted-foreground",
  }[tone]);

/** Page */
export default function TeacherBilling() {
  // TODO: Replace these with real data pulls (Stripe/Supabase) when wired.
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Example state; can be hydrated from your profile/subscription table
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    plan: "Professional",
    status: "Active",
    nextBilling: "2025-09-15",
    amount: "$49.99",
    students: 50,
    assessments: "Unlimited",
  });

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-2025-001",
      date: "2025-08-15",
      amount: "$49.99",
      status: "Paid",
      description: "Professional Plan - Monthly",
    },
    {
      id: "INV-2025-007",
      date: "2025-07-15",
      amount: "$49.99",
      status: "Paid",
      description: "Professional Plan - Monthly",
    },
    {
      id: "INV-2025-006",
      date: "2025-06-15",
      amount: "$49.99",
      status: "Paid",
      description: "Professional Plan - Monthly",
    },
  ]);

  const usageStats: UsageStat[] = useMemo(
    () => [
      { label: "Students", current: 42, limit: 50, icon: Users, color: "primary" },
      {
        label: "Assessments Created",
        current: 23,
        limit: "Unlimited",
        icon: TrendingUp,
        color: "accent",
      },
    ],
    []
  );

  useEffect(() => {
    // Example place to fetch live data later:
    // setLoading(true);
    // fetch("/api/billing/summary").then(...).catch(setErr).finally(() => setLoading(false));
  }, []);

  const isActive =
    subscriptionData.status === "Active" || subscriptionData.status === "Trialing";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {err && (
        <div className="rounded-xl border p-4 text-sm text-destructive bg-destructive/10">
          {err}
        </div>
      )}

      {/* Top grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Overview */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Current Subscription</h3>
              {!isActive ? (
                <Badge className="bg-destructive/20 text-destructive">Inactive</Badge>
              ) : (
                <Badge className="bg-primary/20 text-primary">{subscriptionData.status}</Badge>
              )}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-2xl font-bold text-foreground">
                  {subscriptionData.plan ?? "—"}
                </h4>
                <div className="mt-1 text-sm text-muted-foreground">
                  Next billing: {fmtDate(subscriptionData.nextBilling)}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{subscriptionData.amount}</p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Students</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {typeof subscriptionData.students === "number"
                    ? `Up to ${subscriptionData.students}`
                    : subscriptionData.students}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  <span className="font-medium text-foreground">Assessments</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {String(subscriptionData.assessments)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Subscribe / Upgrade */}
              <CheckoutButton label={isActive ? "Upgrade / Change Plan" : "Subscribe Now"} />
              {/* Future: add a “Manage Billing” button when you expose a portal endpoint */}
              <Button variant="outline" disabled title="Coming soon">
                Update Payment Method
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Usage Statistics */}
        <div>
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Usage This Month</h3>

            <div className="space-y-4">
              {usageStats.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className={clsx("h-4 w-4", textColor(stat.color))} />
                      <span className="text-sm font-medium text-foreground">{stat.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stat.current}/{stat.limit}
                    </span>
                  </div>
                  {typeof stat.limit === "number" && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={clsx("h-2 rounded-full transition-all duration-300", barColor(stat.color))}
                        style={{ width: `${Math.min(100, (stat.current / stat.limit) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Payment Method (placeholder until Billing Portal is wired) */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Payment Method</h3>
        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Managed in Stripe</p>
              <p className="text-sm text-muted-foreground">
                Use the Stripe Billing Portal to update your card
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" disabled title="Coming soon">
            Update
          </Button>
        </div>
      </GlassCard>

      {/* Billing History */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Billing History</h3>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>

        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <DollarSign className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{invoice.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {fmtDate(invoice.date)} <span>•</span>
                    <span>{invoice.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={badgeForInvoice(invoice.status)}>{invoice.status}</span>
                <span className="font-semibold text-foreground">{invoice.amount}</span>
                <Button variant="ghost" size="sm" title="Download invoice (coming soon)" disabled>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
    </div>
  );
}
