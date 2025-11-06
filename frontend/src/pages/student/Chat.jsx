import PageContainer from '../../components/PageContainer.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import ChatWidget from '../../components/ChatWidget.jsx'

export default function Chat() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <PageContainer>
          <h2 className="mb-6 text-3xl font-semibold">AI Tutor Chat</h2>
          <div className="rounded-xl border border-slate-200 p-8 text-center dark:border-slate-800">
            <p className="mb-4 text-slate-600 dark:text-slate-400">
              Use the floating AI Tutor button in the bottom-right corner to chat with your AI tutor.
            </p>
            <p className="text-sm text-slate-500">
              The chat widget will appear when you click the button. Ask questions about your quizzes, get explanations, or request study tips!
            </p>
          </div>
        </PageContainer>
        <ChatWidget />
      </main>
    </div>
  )
}

