import { useState } from 'react';
import { ArrowLeft, Search, BookOpen, Video, Headphones, Heart, Baby, Apple, Brain } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';

const categories = [
  { id: 'pregnancy', name: 'Pregnancy Care', icon: Heart, color: 'text-pink-500' },
  { id: 'baby', name: 'Baby Care', icon: Baby, color: 'text-purple-500' },
  { id: 'nutrition', name: 'Nutrition', icon: Apple, color: 'text-green-500' },
  { id: 'mental', name: 'Mental Health', icon: Brain, color: 'text-blue-500' },
];

const mockContent = [
  {
    id: '1',
    title: 'Nutrition During Pregnancy',
    category: 'nutrition',
    type: 'article',
    duration: '5 min read',
    thumbnail: '🥗',
    description: 'Essential nutrients for a healthy pregnancy'
  },
  {
    id: '2',
    title: 'Exercise Tips for Pregnant Mothers',
    category: 'pregnancy',
    type: 'video',
    duration: '12 min',
    thumbnail: '🧘‍♀️',
    description: 'Safe exercises during each trimester'
  },
  {
    id: '3',
    title: 'Preparing for Childbirth',
    category: 'pregnancy',
    type: 'podcast',
    duration: '25 min',
    thumbnail: '🎧',
    description: 'What to expect during labor and delivery'
  },
  {
    id: '4',
    title: 'Breastfeeding Basics',
    category: 'baby',
    type: 'video',
    duration: '15 min',
    thumbnail: '🍼',
    description: 'Everything you need to know about breastfeeding'
  },
  {
    id: '5',
    title: 'Managing Pregnancy Stress',
    category: 'mental',
    type: 'article',
    duration: '7 min read',
    thumbnail: '🧠',
    description: 'Techniques to stay calm and positive'
  },
  {
    id: '6',
    title: 'Baby Sleep Patterns',
    category: 'baby',
    type: 'article',
    duration: '6 min read',
    thumbnail: '😴',
    description: 'Understanding newborn sleep cycles'
  },
];

export function Education() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredContent = mockContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-500 text-white p-4">
        <div className="flex items-center gap-3 mb-4">
          <ArrowLeft className="w-6 h-6" />
          <h1>Educational Resources</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search articles, videos, podcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Categories */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-pink-500 bg-pink-50' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
                  <p className="text-sm">{category.name}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="article">Articles</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
            <TabsTrigger value="podcast">Podcasts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {filteredContent.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="text-4xl">{item.thumbnail}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm">{item.title}</h3>
                        {getTypeIcon(item.type)}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {item.duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {categories.find(c => c.id === item.category)?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="article" className="space-y-3 mt-4">
            {filteredContent
              .filter(item => item.type === 'article')
              .map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="text-4xl">{item.thumbnail}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm">{item.title}</h3>
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {item.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="video" className="space-y-3 mt-4">
            {filteredContent
              .filter(item => item.type === 'video')
              .map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="text-4xl">{item.thumbnail}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm">{item.title}</h3>
                          <Video className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {item.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="podcast" className="space-y-3 mt-4">
            {filteredContent
              .filter(item => item.type === 'podcast')
              .map(item => (
                <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="text-4xl">{item.thumbnail}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm">{item.title}</h3>
                          <Headphones className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                        <Badge variant="secondary" className="text-xs">
                          {item.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
