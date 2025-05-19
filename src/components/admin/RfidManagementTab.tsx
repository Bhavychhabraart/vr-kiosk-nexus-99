
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  XCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useRFID } from "@/hooks/useRFID";
import { RFIDCard } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const RfidManagementTab = () => {
  const {
    rfidCards,
    isLoading,
    createRFIDCard,
    updateRFIDCard,
    deleteRFIDCard,
    simulateRFIDScan,
  } = useRFID();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<RFIDCard | null>(null);
  const [newCardData, setNewCardData] = useState({
    tag_id: "",
    name: "",
    status: "active",
  });

  const handleAddCard = () => {
    createRFIDCard(newCardData);
    setIsAddDialogOpen(false);
    setNewCardData({ tag_id: "", name: "", status: "active" });
  };

  const handleEditCard = () => {
    if (!selectedCard) return;

    updateRFIDCard(selectedCard);
    setIsEditDialogOpen(false);
    setSelectedCard(null);
  };

  const handleDeleteCard = () => {
    if (!selectedCard) return;

    deleteRFIDCard(selectedCard.id);
    setIsDeleteDialogOpen(false);
    setSelectedCard(null);
  };

  const openEditDialog = (card: RFIDCard) => {
    setSelectedCard(card);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (card: RFIDCard) => {
    setSelectedCard(card);
    setIsDeleteDialogOpen(true);
  };

  const scanNewCard = () => {
    simulateRFIDScan();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">RFID Card Management</h2>
          <p className="text-vr-muted">Manage RFID cards for session tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={scanNewCard}>
            <CreditCard className="mr-2 h-4 w-4" />
            Scan New Card
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-vr-muted" />
        </div>
      ) : rfidCards && rfidCards.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Card ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfidCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono">{card.tag_id}</TableCell>
                  <TableCell>{card.name || "Unnamed"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={card.status === "active" ? "default" : "outline"}
                      className={
                        card.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {card.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {card.last_used_at
                      ? format(new Date(card.last_used_at), "MMM d, yyyy HH:mm")
                      : "Never used"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(card.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(card)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-vr-accent hover:text-vr-accent/80 hover:bg-vr-accent/20"
                        onClick={() => openDeleteDialog(card)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <CreditCard className="h-12 w-12 text-vr-muted mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No RFID Cards</h3>
          <p className="text-vr-muted mb-6">
            Add or scan RFID cards to manage them here
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Card
          </Button>
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add RFID Card</DialogTitle>
            <DialogDescription>
              Enter the details for the new RFID card.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag_id">Card ID</Label>
              <Input
                id="tag_id"
                value={newCardData.tag_id}
                onChange={(e) =>
                  setNewCardData({ ...newCardData, tag_id: e.target.value })
                }
                placeholder="Enter RFID tag ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={newCardData.name}
                onChange={(e) =>
                  setNewCardData({ ...newCardData, name: e.target.value })
                }
                placeholder="Enter a name for this card"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCard}
              disabled={!newCardData.tag_id}
            >
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit RFID Card</DialogTitle>
            <DialogDescription>
              Update the details for this RFID card.
            </DialogDescription>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_tag_id">Card ID</Label>
                <Input
                  id="edit_tag_id"
                  value={selectedCard.tag_id}
                  onChange={(e) =>
                    setSelectedCard({
                      ...selectedCard,
                      tag_id: e.target.value,
                    })
                  }
                  placeholder="Enter RFID tag ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_name">Name (Optional)</Label>
                <Input
                  id="edit_name"
                  value={selectedCard.name || ""}
                  onChange={(e) =>
                    setSelectedCard({
                      ...selectedCard,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter a name for this card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_status">Status</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="status_active"
                      name="status"
                      checked={selectedCard.status === "active"}
                      onChange={() =>
                        setSelectedCard({
                          ...selectedCard,
                          status: "active",
                        })
                      }
                      className="h-4 w-4 text-vr-primary border-vr-muted focus:ring-vr-primary"
                    />
                    <Label htmlFor="status_active" className="text-sm font-normal flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> Active
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="status_inactive"
                      name="status"
                      checked={selectedCard.status === "inactive"}
                      onChange={() =>
                        setSelectedCard({
                          ...selectedCard,
                          status: "inactive",
                        })
                      }
                      className="h-4 w-4 text-vr-primary border-vr-muted focus:ring-vr-primary"
                    />
                    <Label htmlFor="status_inactive" className="text-sm font-normal flex items-center">
                      <XCircle className="h-3 w-3 text-vr-accent mr-1" /> Inactive
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditCard}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete RFID Card?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this RFID card? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-vr-accent hover:bg-vr-accent/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RfidManagementTab;
