
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLeadForms } from "@/hooks/useLeadForms";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  Clock,
  AlertTriangle,
  CheckCircle,
  User
} from "lucide-react";

export const LeadPipeline = () => {
  const { leads, updateLead, loading } = useLeadForms();

  const pipelineStages = [
    { id: 'new', title: 'New Leads', color: 'bg-blue-500' },
    { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500' },
    { id: 'qualified', title: 'Qualified', color: 'bg-green-500' },
    { id: 'converted', title: 'Converted', color: 'bg-purple-500' },
    { id: 'lost', title: 'Lost', color: 'bg-red-500' }
  ];

  const getLeadsByStage = (stage: string) => {
    return leads.filter(lead => lead.status === stage);
  };

  const getScoreIcon = (score: string) => {
    switch (score) {
      case 'hot':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warm':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cold':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    await updateLead(draggableId, { status: newStatus });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lead Pipeline</h2>
        <div className="flex gap-2">
          {pipelineStages.map(stage => (
            <div key={stage.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
              <span className="text-sm font-medium">{stage.title}</span>
              <Badge variant="outline">{getLeadsByStage(stage.id).length}</Badge>
            </div>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pipelineStages.map(stage => (
            <div key={stage.id} className="space-y-4">
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                    {stage.title}
                    <Badge variant="outline" className="ml-auto">
                      {getLeadsByStage(stage.id).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200' : ''
                    }`}
                  >
                    {getLeadsByStage(stage.id).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg rotate-2' : 'hover:shadow-md'
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm">
                                      {lead.display_name || 'Unknown'}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      {lead.display_email || 'No email'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {getScoreIcon(lead.score)}
                                    <Badge className={`text-xs ${getScoreColor(lead.score)}`}>
                                      {lead.score}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                  {new Date(lead.created_at).toLocaleDateString()}
                                </div>

                                {lead.display_phone && (
                                  <div className="text-xs text-gray-600 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {lead.display_phone}
                                  </div>
                                )}

                                <div className="flex gap-1 pt-2">
                                  <Button size="sm" variant="outline" className="text-xs p-1 h-6">
                                    <Phone className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs p-1 h-6">
                                    <Mail className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-xs p-1 h-6">
                                    <MessageSquare className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
