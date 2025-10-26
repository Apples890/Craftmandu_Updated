-- When a new message is created, insert a notification for the opposite party
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS trigger AS $$
DECLARE
  conv RECORD;
  recipient uuid;
BEGIN
  SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;

  IF NEW.sender_id = conv.customer_id THEN
    recipient := (SELECT user_id FROM vendors WHERE id = conv.vendor_id);
  ELSE
    recipient := conv.customer_id;
  END IF;

  INSERT INTO notifications (user_id, type, title, body, data, created_at)
  VALUES (recipient, 'MESSAGE', 'New message', NEW.content, jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id), now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_message ON messages;
CREATE TRIGGER trg_notify_new_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION notify_new_message();
