import { Badge, Button, Card, Input, Select, Textarea } from "@/components/ui/primitives";

const reviews = [
  {
    id: "REV-9001",
    rider: "Ava Smith",
    driver: "Mia Patel",
    rating: "5.0",
    sentiment: "Positive",
    comment: "Driver was patient and helped with wheelchair loading.",
    status: "Closed",
  },
  {
    id: "REV-9002",
    rider: "Leo Khan",
    driver: "Liam Tran",
    rating: "3.5",
    sentiment: "Mixed",
    comment: "Vehicle arrived late by 11 minutes.",
    status: "Follow-up",
  },
  {
    id: "REV-9003",
    rider: "Grace P.",
    driver: "Noah V.",
    rating: "2.0",
    sentiment: "Negative",
    comment: "Drop-off communication was unclear.",
    status: "Escalated",
  },
];

export default function AdminReviewsPage() {
  return (
    <div className="space-y-4">
      <Card className="bg-[var(--color-primary)] text-white">
        <h1 className="text-2xl font-bold">Driver Reviews & Quality</h1>
        <p className="mt-2 text-sm text-indigo-100">
          Review rider feedback, monitor service quality trends, and assign corrective actions.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Average Rating</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">4.7</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">5-star Trips</p>
          <p className="text-2xl font-bold text-emerald-700">82%</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Needs Follow-up</p>
          <p className="text-2xl font-bold text-amber-700">9</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Escalated Quality Cases</p>
          <p className="text-2xl font-bold text-red-700">2</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Open Review Case</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input placeholder="Review ID / Trip ID" />
          <Input placeholder="Driver name" />
          <Select>
            <option>Case: Coaching required</option>
            <option>Case: Rider callback</option>
            <option>Case: Escalate to compliance</option>
          </Select>
          <Select>
            <option>Priority: Medium</option>
            <option>Priority: High</option>
            <option>Priority: Low</option>
          </Select>
          <Textarea className="md:col-span-4" placeholder="Quality review notes" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button>Create Action Plan</Button>
          <Button variant="outline">Schedule Driver Coaching</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Recent Feedback</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Review</th>
                <th className="py-2 pr-3">Rider</th>
                <th className="py-2 pr-3">Driver</th>
                <th className="py-2 pr-3">Rating</th>
                <th className="py-2 pr-3">Sentiment</th>
                <th className="py-2 pr-3">Comment</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b">
                  <td className="py-2 pr-3 font-medium text-slate-900">{review.id}</td>
                  <td className="py-2 pr-3">{review.rider}</td>
                  <td className="py-2 pr-3">{review.driver}</td>
                  <td className="py-2 pr-3">{review.rating}</td>
                  <td className="py-2 pr-3">
                    <Badge
                      tone={
                        review.sentiment === "Positive"
                          ? "certified"
                          : review.sentiment === "Mixed"
                            ? "pending"
                            : "danger"
                      }
                    >
                      {review.sentiment}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3 text-xs text-slate-600">{review.comment}</td>
                  <td className="py-2">
                    <Badge
                      tone={
                        review.status === "Closed"
                          ? "certified"
                          : review.status === "Follow-up"
                            ? "pending"
                            : "danger"
                      }
                    >
                      {review.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
