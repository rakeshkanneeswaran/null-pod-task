enum Priority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

interface EventViewProps {
  eventTitle: string;
  setEventTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onDelete?: () => void;
  priority: Priority; // Add this
  setPriority: React.Dispatch<React.SetStateAction<Priority>>; // Add this
}

export const EventView: React.FC<EventViewProps> = ({
  eventTitle,
  setEventTitle,
  handleSubmit,
  isEditing,
  onDelete,
  priority,
  setPriority,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? "Edit Event" : "Add New Event"}
        </h2>
        <label className="block mb-2">
          Event Title:
          <input
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="border rounded-md p-2 w-full"
            required
          />
        </label>

        <label className="block mb-4">
          Priority:
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as Priority)}
            className="border rounded-md p-2 w-full"
          >
            <option value={Priority.LOW}>Low</option>
            <option value={Priority.MEDIUM}>Medium</option>
            <option value={Priority.HIGH}>High</option>
          </select>
        </label>

        <div className="flex justify-end gap-2">
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            {isEditing ? "Update" : "Add"} Event
          </button>
        </div>
      </div>
    </form>
  );
};
