import { GlassCard } from "@/components/reusable/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, Mail, BookOpen, TrendingUp, Plus, Send, Trash2, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Class {
  id: string;
  name: string;
  description?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  class_name?: string;
  class_id?: string;
  status: 'active' | 'removed';
  joined_at: string;
  progress?: number;
}

interface StudentInvite {
  id: string;
  code: string;
  student_name: string;
  email: string;
  class_id: string;
  class_name: string;
  status: 'pending' | 'used' | 'expired';
  created_at: string;
  expires_at: string;
}

export default function TeacherStudents() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [invites, setInvites] = useState<StudentInvite[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    fetchData();
  }, [profile?.user_id]);

  const fetchData = async () => {
    if (!profile?.user_id) return;

    try {
      setLoading(true);
      
      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', profile.user_id)
        .eq('is_active', true);

      if (classesError) throw classesError;
      setClasses(classesData || []);

      // Fetch students with class info using proper joins
      if (classesData && classesData.length > 0) {
        const { data: studentsData, error: studentsError } = await supabase
          .from('class_members')
          .select(`
            *,
            profiles (
              user_id,
              first_name,
              last_name,
              email
            ),
            classes (
              id,
              name
            )
          `)
          .in('class_id', classesData.map(c => c.id))
          .neq('status', 'removed');

        if (studentsError) {
          console.error('Students fetch error:', studentsError);
        } else {
          const formattedStudents = studentsData?.map(student => ({
            id: student.student_id,
            name: `${(student.profiles as any)?.first_name || ''} ${(student.profiles as any)?.last_name || ''}`.trim(),
            email: (student.profiles as any)?.email || '',
            class_name: (student.classes as any)?.name || '',
            class_id: student.class_id,
            status: student.status as 'active' | 'removed',
            joined_at: student.joined_at,
            progress: Math.floor(Math.random() * 30) + 70, // Mock data
          })) || [];

          setStudents(formattedStudents);
        }
      }

      // Fetch pending invites
      const { data: invitesData, error: invitesError } = await supabase
        .from('student_invites')
        .select(`
          *,
          classes (
            name
          )
        `)
        .eq('teacher_id', profile.user_id)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (invitesError) {
        console.error('Invites fetch error:', invitesError);
      } else {
        const formattedInvites = invitesData?.map(invite => ({
          id: invite.id,
          code: invite.code,
          student_name: invite.student_name,
          email: invite.email,
          class_id: invite.class_id,
          class_name: (invite.classes as any)?.name || '',
          status: invite.status as 'pending' | 'used' | 'expired',
          created_at: invite.created_at,
          expires_at: invite.expires_at,
        })) || [];

        setInvites(formattedInvites);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteStudent = async () => {
    if (!studentName.trim() || !email.trim() || !selectedClassId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Create invite
      const { data: inviteData, error: inviteError } = await supabase.rpc(
        'create_invite_and_email',
        {
          student_name_input: studentName.trim(),
          email_input: email.trim(),
          class_id_input: selectedClassId,
        }
      );

      if (inviteError) throw inviteError;

      const inviteCode = inviteData[0]?.code;
      const selectedClass = classes.find(c => c.id === selectedClassId);

      // Send email
      const { error: emailError } = await supabase.functions.invoke('send-student-invite', {
        body: {
          studentName: studentName.trim(),
          email: email.trim(),
          inviteCode,
          className: selectedClass?.name || '',
          teacherName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Your teacher',
        },
      });

      if (emailError) throw emailError;

      toast({
        title: "Success",
        description: `Invitation sent to ${email}`,
      });

      // Reset form and close dialog
      setStudentName("");
      setEmail("");
      setSelectedClassId("");
      setDialogOpen(false);
      
      // Refresh data
      fetchData();

    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendInvite = async (inviteCode: string) => {
    try {
      setSubmitting(true);

      const invite = invites.find(inv => inv.code === inviteCode);
      if (!invite) return;

      // Validate invite can be resent
      const { error: validateError } = await supabase.rpc('resend_invite', {
        invite_code_input: inviteCode,
      });

      if (validateError) throw validateError;

      // Send email again
      const { error: emailError } = await supabase.functions.invoke('send-student-invite', {
        body: {
          studentName: invite.student_name,
          email: invite.email,
          inviteCode: invite.code,
          className: invite.class_name,
          teacherName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Your teacher',
        },
      });

      if (emailError) throw emailError;

      toast({
        title: "Success",
        description: `Invitation resent to ${invite.email}`,
      });

    } catch (error: any) {
      console.error('Error resending invite:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentId: string, classId: string) => {
    try {
      setSubmitting(true);

      const { error } = await supabase.rpc('remove_student_from_class', {
        student_id_input: studentId,
        class_id_input: classId,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student removed from class",
      });

      fetchData();

    } catch (error: any) {
      console.error('Error removing student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove student",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allStudentsAndInvites = [
    ...students.map(s => ({ ...s, type: 'student' as const })),
    ...invites.map(i => ({ 
      id: i.id,
      name: i.student_name,
      email: i.email,
      class_name: i.class_name,
      class_id: i.class_id,
      status: i.status as 'pending',
      joined_at: i.created_at,
      type: 'invite' as const,
      code: i.code,
      expires_at: i.expires_at,
    }))
  ];

  const filteredData = allStudentsAndInvites.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.class_name && item.class_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string, type: string) => {
    if (type === 'invite' && status === 'pending') {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
    if (status === 'active') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
    }
    return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage your students and send invitations</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Student</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Student</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter student's full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleInviteStudent}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Sending..." : "Send Invitation"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students and invites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined/Invited</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {item.class_name || 'No class'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status, item.type)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(item.joined_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {item.type === 'invite' && 'expires_at' in item && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        <span>
                          Expires {format(new Date(item.expires_at), 'MMM d')}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {item.type === 'invite' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvite('code' in item ? item.code : '')}
                          disabled={submitting}
                          className="flex items-center space-x-1"
                        >
                          <Send className="h-3 w-3" />
                          <span>Resend</span>
                        </Button>
                      )}
                      {item.type === 'student' && item.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveStudent(item.id, item.class_id || '')}
                          disabled={submitting}
                          className="flex items-center space-x-1 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Remove</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Start by inviting your first student"}
              </p>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}