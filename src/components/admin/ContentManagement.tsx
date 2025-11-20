import { useState } from 'react';
import { ArrowLeft, Plus, Video, BookOpen, Headphones, Edit, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const mockContent = [
  {
    id: '1',
    title: 'Nutrition During Pregnancy',
    category: 'nutrition',
    type: 'article',
    status: 'published',
    views: 1234,
  },
  {
    id: '2',
    title: 'Exercise Tips for Pregnant Mothers',
    category: 'pregnancy',
    type: 'video',
    status: 'published',
    views: 892,
  },
  {
    id: '3',
    title: 'Managing Pregnancy Stress',
    category: 'mental',
    type: 'article',
    status: 'draft',
    views: 0,
  },
];

export function ContentManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'podcast':
        return <Headphones className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <Badge className="bg-green-100 text-green-700">Published</Badge>
    ) : (
      <Badge className="bg-gray-200 text-gray-700">Draft</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6" />
            <h1>Content Management</h1>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-white text-blue-500 hover:bg-blue-50">
                <Plus className="w-4 h-4 mr-1" />
                Add Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Content</DialogTitle>
                <DialogDescription>
                  Create educational content for mothers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Content title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Content Type</Label>
                  <Select>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pregnancy">Pregnancy Care</SelectItem>
                      <SelectItem value="baby">Baby Care</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="mental">Mental Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>

                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  Create Content
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="podcast">Podcasts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {mockContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <h3 className="text-sm">{item.title}</h3>
                      </div>
                      <p className="text-xs text-gray-600 capitalize">{item.category}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span>{item.views} views</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="article" className="space-y-3">
            {mockContent
              .filter(item => item.type === 'article')
              .map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-600">{item.views} views</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="video" className="space-y-3">
            {mockContent
              .filter(item => item.type === 'video')
              .map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-600">{item.views} views</p>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="podcast" className="space-y-3">
            <p className="text-center text-sm text-gray-500 py-8">No podcast content yet</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
