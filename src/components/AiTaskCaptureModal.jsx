import AiCaptureDialog from "./AiCaptureDialog";

export default function AiTaskCaptureModal(props) {
  return <AiCaptureDialog {...props} targetDomain={"TASK"}
    title="Capture a task"
    description="Describe what needs doing, or add a screenshot."
    placeholder="Prepare the presentation by Friday. First collect the latest numbers, then draft five slides."
    label="What needs doing?"
    imageLabel="Add a note or screenshot"
    task={true} />;
}
