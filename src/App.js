import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash } from "tabler-icons-react";
import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState({ title: "", summary: "", state: "", deadline: "" });
  const [sorting, setSorting] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const titleRef = useRef(null);
  const summaryRef = useRef(null);
  const [newTaskState, setNewTaskState] = useState("Not done");
  const [newDeadline, setNewDeadline] = useState(() => new Date().toISOString().slice(0, 10));

  function createTask() {
    const newTask = {
      title: titleRef.current?.value || "",
      summary: summaryRef.current?.value || "",
      state: newTaskState,
      deadline: newDeadline,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    if (titleRef.current) titleRef.current.value = "";
    if (summaryRef.current) summaryRef.current.value = "";
    setNewTaskState("Not done");
    setNewDeadline(new Date().toISOString().slice(0, 10));
  }

  function deleteTask(index) {
    const clonedTasks = [...tasks];
    clonedTasks.splice(index, 1);
    setTasks(clonedTasks);
    saveTasks(clonedTasks);
  }

  function loadTasks() {
    const loadedTasks = localStorage.getItem("tasks");
    if (loadedTasks) {
      const parsed = JSON.parse(loadedTasks);
      if (Array.isArray(parsed)) {
        setTasks(parsed);
      }
    }
  }

  function saveTasks(tasksToSave) {
    localStorage.setItem("tasks", JSON.stringify(tasksToSave));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function openEditModal(index) {
    setEditIndex(index);
    setEditData({
      title: tasks[index].title,
      summary: tasks[index].summary,
      state: tasks[index].state,
      deadline: tasks[index].deadline,
    });
    setOpenedEdit(true);
  }

  function editTask() {
    const clonedTasks = [...tasks];
    clonedTasks[editIndex] = {
      title: editData.title,
      summary: editData.summary,
      state: editData.state,
      deadline: editData.deadline,
    };
    setTasks(clonedTasks);
    saveTasks(clonedTasks);
    setOpenedEdit(false);
  }

  function getDisplayedTasks() {
    let arr = tasks.map((task, i) => ({ ...task, originalIndex: i }));
    if (sorting === "done") {
      arr.sort((a, b) => (a.state === "Done" && b.state !== "Done" ? -1 : 1));
    }
    if (sorting === "doing") {
      arr.sort((a, b) =>
        a.state === "Doing right now" && b.state !== "Doing right now" ? -1 : 1
      );
    }
    if (sorting === "notdone") {
      arr.sort((a, b) => (a.state === "Not done" && b.state !== "Not done" ? -1 : 1));
    }
    if (sorting === "deadline") {
      arr.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
    }
    if (filterValue === "Done") {
      arr = arr.filter((t) => t.state === "Done");
    }
    if (filterValue === "Not done") {
      arr = arr.filter((t) => t.state === "Not done");
    }
    if (filterValue === "Doing right now") {
      arr = arr.filter((t) => t.state === "Doing right now");
    }
    return arr;
  }

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size="md"
            title="New Task"
            withCloseButton={false}
            onClose={() => setOpened(false)}
            centered
          >
            <TextInput
              mt="md"
              ref={titleRef}
              placeholder="Task Title"
              required
              label="Title"
            />
            <TextInput
              mt="md"
              ref={summaryRef}
              placeholder="Task Summary"
              label="Summary"
            />
            <Select
              mt="md"
              label="State"
              data={[
                { value: "Done", label: "Done" },
                { value: "Not done", label: "Not done" },
                { value: "Doing right now", label: "Doing right now" },
              ]}
              placeholder="Pick one"
              value={newTaskState}
              onChange={(value) => setNewTaskState(value || "Not done")}
            />
            <TextInput
              mt="md"
              placeholder="Deadline"
              label="Deadline"
              type="date"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
            />
            <Group mt="md" position="apart">
              <Button onClick={() => setOpened(false)} variant="subtle">
                Cancel
              </Button>
              <Button onClick={createTask}>Create Task</Button>
            </Group>
          </Modal>

          <Modal
            opened={openedEdit}
            size="md"
            title="Edit Task"
            withCloseButton={false}
            onClose={() => setOpenedEdit(false)}
            centered
          >
            <TextInput
              mt="md"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              placeholder="Task Title"
              required
              label="Title"
            />
            <TextInput
              mt="md"
              value={editData.summary}
              onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
              placeholder="Task Summary"
              label="Summary"
            />
            <Select
              mt="md"
              label="State"
              data={[
                { value: "Done", label: "Done" },
                { value: "Not done", label: "Not done" },
                { value: "Doing right now", label: "Doing right now" },
              ]}
              value={editData.state}
              onChange={(value) => setEditData({ ...editData, state: value || "Not done" })}
            />
            <TextInput
              mt="md"
              placeholder="Deadline"
              label="Deadline"
              type="date"
              value={editData.deadline}
              onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
            />
            <Group mt="md" position="apart">
              <Button
                onClick={() => setOpenedEdit(false)}
                variant="subtle"
              >
                Cancel
              </Button>
              <Button onClick={editTask}>Save</Button>
            </Group>
          </Modal>

          <Container size={550} my={40}>
            <Group position="apart">
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color="blue"
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}
              </ActionIcon>
            </Group>

            <Group mt="md">
              <Button onClick={() => setSorting("done")}>Show 'Done' first</Button>
              <Button onClick={() => setSorting("doing")}>Show 'Doing' first</Button>
              <Button onClick={() => setSorting("notdone")}>Show 'Not done' first</Button>
              <Button onClick={() => setSorting("deadline")}>Sort by deadline</Button>
            </Group>

            <Group mt="md">
              <Button onClick={() => setFilterValue("Done")}>Show only 'Done'</Button>
              <Button onClick={() => setFilterValue("Not done")}>Show only 'Not done'</Button>
              <Button onClick={() => setFilterValue("Doing right now")}>Show only 'Doing'</Button>
            </Group>

            {getDisplayedTasks().length > 0 ? (
              getDisplayedTasks().map((item) => {
                if (item.title) {
                  return (
                    <Card withBorder key={item.originalIndex} mt="sm">
                      <Group position="apart">
                        <Text weight="bold">{item.title}</Text>
                        <Group>
                          <ActionIcon
                            onClick={() => openEditModal(item.originalIndex)}
                            color="blue"
                            variant="transparent"
                          >
                            Edit
                          </ActionIcon>
                          <ActionIcon
                            onClick={() => deleteTask(item.originalIndex)}
                            color="red"
                            variant="transparent"
                          >
                            <Trash />
                          </ActionIcon>
                        </Group>
                      </Group>
                      <Text color="dimmed" size="md" mt="sm">
                        {item.summary || "No summary was provided for this task"}
                      </Text>
                      <Text mt="sm">State: {item.state || "Not set"}</Text>
                      <Text mt="sm">Deadline: {item.deadline || "Not set"}</Text>
                    </Card>
                  );
                }
              })
            ) : (
              <Text size="lg" mt="md" color="dimmed">
                You have no tasks
              </Text>
            )}

            <Button
              onClick={() => setOpened(true)}
              fullWidth
              mt="md"
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
