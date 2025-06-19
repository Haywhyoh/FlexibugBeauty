
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Filter } from "lucide-react";
import { useTimeBlocks, TimeBlock } from "@/hooks/useTimeBlocks";
import { TimeBlockForm } from "./TimeBlockForm";
import { TimeBlockCard } from "./TimeBlockCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const TimeBlocksManager = () => {
  const { timeBlocks, loading, createTimeBlock, updateTimeBlock, deleteTimeBlock } = useTimeBlocks();
  const [showForm, setShowForm] = useState(false);
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(null);
  const [filter, setFilter] = useState<'all' | TimeBlock['type']>('all');

  const handleSave = async (
    startTime: string,
    endTime: string,
    type: TimeBlock['type'],
    title?: string,
    description?: string
  ) => {
    if (editingTimeBlock) {
      await updateTimeBlock(editingTimeBlock.id, {
        start_time: startTime,
        end_time: endTime,
        type,
        title,
        description,
      });
      setEditingTimeBlock(null);
    } else {
      await createTimeBlock(startTime, endTime, type, title, description);
    }
    setShowForm(false);
  };

  const handleEdit = (timeBlock: TimeBlock) => {
    setEditingTimeBlock(timeBlock);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTimeBlock(null);
  };

  const filteredTimeBlocks = timeBlocks.filter(block => 
    filter === 'all' || block.type === filter
  );

  const upcomingBlocks = filteredTimeBlocks.filter(block => 
    new Date(block.start_time) > new Date()
  );

  const activeBlocks = filteredTimeBlocks.filter(block => {
    const now = new Date();
    return new Date(block.start_time) <= now && new Date(block.end_time) >= now;
  });

  const pastBlocks = filteredTimeBlocks.filter(block => 
    new Date(block.end_time) < new Date()
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading time blocks...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Time Blocks Management
          </h2>
          <p className="text-gray-600 mt-1">Manage your vacation periods, breaks, and unavailable times</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Time Block
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-800">{upcomingBlocks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-gray-800">{activeBlocks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{timeBlocks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      {showForm && (
        <TimeBlockForm
          onSave={handleSave}
          onCancel={handleCancel}
          initialData={editingTimeBlock || undefined}
          isEditing={!!editingTimeBlock}
        />
      )}

      {/* Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              Time Blocks
            </CardTitle>
            <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTimeBlocks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No time blocks found</h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' 
                  ? "You haven't created any time blocks yet." 
                  : `No ${filter} time blocks found.`
                }
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create your first time block
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active blocks */}
              {activeBlocks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-purple-600 text-white">Active Now</Badge>
                    <span className="text-sm text-gray-600">{activeBlocks.length} active</span>
                  </div>
                  <div className="grid gap-4">
                    {activeBlocks.map((timeBlock) => (
                      <TimeBlockCard
                        key={timeBlock.id}
                        timeBlock={timeBlock}
                        onEdit={handleEdit}
                        onDelete={deleteTimeBlock}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming blocks */}
              {upcomingBlocks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">Upcoming</Badge>
                    <span className="text-sm text-gray-600">{upcomingBlocks.length} upcoming</span>
                  </div>
                  <div className="grid gap-4">
                    {upcomingBlocks.map((timeBlock) => (
                      <TimeBlockCard
                        key={timeBlock.id}
                        timeBlock={timeBlock}
                        onEdit={handleEdit}
                        onDelete={deleteTimeBlock}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Past blocks */}
              {pastBlocks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">Past</Badge>
                    <span className="text-sm text-gray-600">{pastBlocks.length} past</span>
                  </div>
                  <div className="grid gap-4">
                    {pastBlocks.map((timeBlock) => (
                      <TimeBlockCard
                        key={timeBlock.id}
                        timeBlock={timeBlock}
                        onEdit={handleEdit}
                        onDelete={deleteTimeBlock}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
