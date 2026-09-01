import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { action } = body;

    if (!action || !['confirm', 'collect', 'cancel'].includes(action)) {
      return NextResponse.json(
        { message: "Invalid action. Use: confirm, collect, cancel" },
        { status: 400 }
      );
    }

    // Get current status
    const current = await query(`
      SELECT o.id, os.status_name as status
      FROM orders o
      JOIN order_status os ON os.id = o.status_id
      WHERE o.id = $1
    `, [id]);

    if (current.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const statusMap: Record<string, { from: string[], to: string }> = {
      confirm: { from: ['Pending'], to: 'Confirmed' },
      collect: { from: ['Confirmed'], to: 'Collected' },
      cancel: { from: ['Pending', 'Confirmed'], to: 'Cancelled' },
    };

    const currentStatus = current[0].status;
    if (!statusMap[action].from.includes(currentStatus)) {
      return NextResponse.json(
        { message: `Cannot ${action} an order that is '${currentStatus}'` },
        { status: 400 }
      );
    }

    const statusResult = await query(
      `SELECT id FROM order_status WHERE status_name = $1`,
      [statusMap[action].to]
    );
    const newStatusId = statusResult[0]?.id;

    await query(`
      UPDATE orders 
      SET 
        status_id = $1,
        collection_date = CASE WHEN $1 = (SELECT id FROM order_status WHERE status_name = 'Collected') THEN NOW() ELSE collection_date END
      WHERE id = $2
    `, [newStatusId, id]);

    return NextResponse.json({
      message: `Order ${action}ed successfully`,
      status: statusMap[action].to
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update order status" },
      { status: 400 }
    );
  }
}