import React, { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import type { ApprovalFlow, ApprovalNode } from '@/types';
import { Plus, Save, Trash2, GripVertical, ChevronRight, Zap, ArrowUp, Workflow } from 'lucide-react';
import { genId } from '@/utils/formatters';

const ApprovalConfigPage: React.FC = () => {
  const store = useAppStore.getState();
  const [flows, setFlows] = useState<ApprovalFlow[]>(store.approvalFlows);
  const [selectedId, setSelectedId] = useState<string>(flows[0]?.id || '');
  const users = store.users;
  const approvers = users.filter(u => u.role === 'approver' || u.role === 'admin');
  const selectedFlow = flows.find(f => f.id === selectedId);

  const persist = (next: ApprovalFlow[]) => useAppStore.setState({ approvalFlows: next });

  const updateFlows = (mutator: (arr: ApprovalFlow[]) => ApprovalFlow[]) => {
    const next = mutator(flows);
    setFlows(next);
    return next;
  };

  const createFlow = () => {
    const nf: ApprovalFlow = {
      id: genId('flow_'), name: '新审批流程', isActive: false,
      nodes: [{ id: genId('n_'), name: '初审节点', order: 1, assigneeId: users[0].id, assigneeName: users[0].name, timeoutHours: 4, escalateAfterHours: 8, escalationTargetId: '', escalationTargetName: '' }],
    };
    const updated = updateFlows(fs => [...fs, nf]);
    persist(updated);
    setSelectedId(nf.id);
  };

  const toggleFlowActive = (id: string) => {
    const updated = updateFlows(fs => fs.map(f => (f.id === id ? { ...f, isActive: !f.isActive } : f)));
    persist(updated);
  };

  const updateFlow = (patch: Partial<ApprovalFlow>) => {
    if (!selectedFlow) return;
    updateFlows(fs => fs.map(f => (f.id === selectedFlow.id ? { ...f, ...patch } : f)));
  };

  const updateNode = (nodeId: string, patch: Partial<ApprovalNode>) => {
    if (!selectedFlow) return;
    updateFlows(fs => fs.map(f => f.id === selectedFlow.id ? { ...f, nodes: f.nodes.map(n => (n.id === nodeId ? { ...n, ...patch } : n)) } : f));
  };

  const addNode = () => {
    if (!selectedFlow) return;
    const nextOrder = selectedFlow.nodes.length + 1;
    updateFlow({ nodes: [...selectedFlow.nodes, { id: genId('n_'), name: `节点${nextOrder}`, order: nextOrder, assigneeId: users[0].id, assigneeName: users[0].name, timeoutHours: 4, escalateAfterHours: 8, escalationTargetId: '', escalationTargetName: '' }] });
  };

  const removeNode = (nodeId: string) => {
    if (!selectedFlow || selectedFlow.nodes.length <= 1) return;
    const filtered = selectedFlow.nodes.filter(n => n.id !== nodeId).map((n, i) => ({ ...n, order: i + 1 }));
    updateFlow({ nodes: filtered });
  };

  const swapNodes = (idxA: number, idxB: number) => {
    if (!selectedFlow) return;
    const nodes = [...selectedFlow.nodes];
    [nodes[idxA], nodes[idxB]] = [nodes[idxB], nodes[idxA]];
    updateFlow({ nodes: nodes.map((n, i) => ({ ...n, order: i + 1 })) });
  };

  const handleSave = () => persist(flows);

  return (
    <div className="p-6 space-y-6">
      <div className="page-header">
        <div>
          <h1 className="section-title flex items-center gap-3"><Workflow className="text-primary-light" size={28} />审批流程配置</h1>
          <p className="text-text-muted text-sm mt-1">配置空域审批的自动化流程节点与升级策略</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-colors" onClick={() => selectedFlow && toggleFlowActive(selectedFlow.id)}>
            <span className="text-sm text-text-secondary">启用审批流程</span>
            <div className={`w-10 h-5 rounded-full relative ${selectedFlow?.isActive ? 'bg-primary' : 'bg-text-muted/30'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${selectedFlow?.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </label>
          <button onClick={createFlow} className="btn-primary flex items-center gap-2"><Plus size={18} />新建流程</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-4 space-y-3">
          {flows.map(f => (
            <div key={f.id} onClick={() => setSelectedId(f.id)} className={`glass-card p-4 cursor-pointer transition-all duration-300 ${selectedId === f.id ? 'border-primary/60 shadow-glow-primary/40' : 'hover:border-primary/30'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-text-primary truncate">{f.name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-text-muted"><Zap size={12} className="text-primary-light" />{f.nodes.length} 个节点</span>
                    <span className="flex items-center gap-1 text-xs text-text-muted"><ChevronRight size={12} className="text-accent" /><span className={f.isActive ? 'text-success' : 'text-text-muted'}>{f.isActive ? '已启用' : '已停用'}</span></span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); toggleFlowActive(f.id); }} className={`w-10 h-6 rounded-full relative flex-shrink-0 ${f.isActive ? 'bg-primary' : 'bg-text-muted/30'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${f.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-8">
          <div className="glass-card p-5 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border-light">
              <div>
                <input value={selectedFlow?.name || ''} onChange={e => updateFlow({ name: e.target.value })} className="text-xl font-display font-bold bg-transparent border-b-2 border-transparent hover:border-border focus:border-primary/50 focus:outline-none text-text-primary px-1 py-0.5 transition-colors w-80" placeholder="流程名称" />
                <p className="text-text-muted text-sm mt-1">{selectedFlow?.nodes.length || 0} 个审批节点</p>
              </div>
              <button onClick={addNode} className="btn-accent flex items-center gap-2"><Plus size={16} />添加节点</button>
            </div>

            <div className="relative space-y-4">
              {selectedFlow?.nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  {idx > 0 && <div className="flex justify-center py-1"><div className="w-0.5 h-6 bg-gradient-to-b from-primary/60 to-primary/20 rounded-full" /></div>}
                  <div className="glass-card p-4 border-l-4 border-primary/60 relative group">
                    <div className="absolute top-4 left-4 opacity-40 group-hover:opacity-100 transition-opacity"><GripVertical size={18} className="text-text-muted cursor-grab" /></div>
                    <div className="flex items-start gap-3 pl-8">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-white shadow-glow-primary">{node.order}</div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-text-muted mb-1.5 block">节点名称</label>
                          <input value={node.name} onChange={e => updateNode(node.id, { name: e.target.value })} className="input-field text-sm" placeholder="节点名称" />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted mb-1.5 block">审批人</label>
                          <select value={node.assigneeId} onChange={e => { const u = users.find(x => x.id === e.target.value); updateNode(node.id, { assigneeId: e.target.value, assigneeName: u?.name || '' }); }} className="input-field text-sm">
                            {approvers.map(u => <option key={u.id} value={u.id}>{u.name} · {u.department}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-text-muted mb-1.5 flex items-center justify-between"><span>超时时间 (小时)</span><span className="text-primary-light font-mono">{node.timeoutHours}h</span></label>
                          <input type="range" min="1" max="168" value={node.timeoutHours} onChange={e => updateNode(node.id, { timeoutHours: Number(e.target.value) })} className="w-full h-2 bg-bg-secondary rounded-lg cursor-pointer accent-primary" />
                        </div>
                        <div>
                          <label className="text-xs text-text-muted mb-1.5 flex items-center justify-between"><ArrowUp size={12} className="text-warning" /><span>升级阈值 (小时)</span><span className="text-warning font-mono">{node.escalateAfterHours}h</span></label>
                          <input type="range" min="1" max="240" value={node.escalateAfterHours} onChange={e => updateNode(node.id, { escalateAfterHours: Number(e.target.value) })} className="w-full h-2 bg-bg-secondary rounded-lg cursor-pointer accent-warning" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-text-muted mb-1.5 block">升级目标</label>
                          <select value={node.escalationTargetId || ''} onChange={e => { const u = users.find(x => x.id === e.target.value); updateNode(node.id, { escalationTargetId: e.target.value, escalationTargetName: u?.name || '' }); }} className="input-field text-sm">
                            <option value="">不升级</option>
                            {approvers.map(u => <option key={u.id} value={u.id}>{u.name} · {u.department}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <button onClick={() => swapNodes(idx, idx - 1)} disabled={idx === 0} className="p-1.5 rounded-lg bg-bg-secondary text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} className="-rotate-90" /></button>
                        <button onClick={() => swapNodes(idx, idx + 1)} disabled={!selectedFlow || idx === selectedFlow.nodes.length - 1} className="p-1.5 rounded-lg bg-bg-secondary text-text-secondary hover:bg-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16} className="rotate-90" /></button>
                        <button onClick={() => removeNode(node.id)} disabled={!selectedFlow || selectedFlow.nodes.length <= 1} className="p-1.5 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-border-light">
              <button onClick={handleSave} className="btn-primary flex items-center gap-2"><Save size={18} />保存配置</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalConfigPage;
