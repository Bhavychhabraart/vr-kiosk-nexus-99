
import React, { useState } from "react";
import { useRFID } from "@/hooks/useRFID";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusCircle, Pencil, Trash2, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { RFIDCard } from "@/types";

// Form schema for RFID card creation/editing
const rfidCardSchema = z.object({
  tag_id: z.string().min(1, "Tag ID is required"),
  name: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

type RFIDCardFormValues = z.infer<typeof rfidCardSchema>;

const RfidManagementTab: React.FC = () => {
  const {
    rfidCards,
    isLoadingCards,
    cardsError,
    createCard,
    updateCard,
    deleteCard,
    startRFIDScan,
    isCreatingCard,
    isUpdatingCard,
    isDeletingCard,
    scannedRFID
  } = useRFID();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<RFIDCard | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<RFIDCard | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Initialize form
  const form = useForm<RFIDCardFormValues>({
    resolver: zodResolver(rfidCardSchema),
    defaultValues: {
      tag_id: "",
      name: "",
      status: "active",
    },
  });

  // Open form dialog for creating a new card
  const handleOpenNewCardForm = () => {
    form.reset({ tag_id: "", name: "", status: "active" });
    setEditingCard(null);
    setIsFormOpen(true);
  };

  // Open form dialog for editing an existing card
  const handleEditCard = (card: RFIDCard) => {
    form.reset({
      tag_id: card.tag_id,
      name: card.name || "",
      status: card.status as "active" | "inactive",
    });
    setEditingCard(card);
    setIsFormOpen(true);
  };

  // Handle form submission for both create and update
  const onSubmit = (values: RFIDCardFormValues) => {
    if (editingCard) {
      // Update existing card
      updateCard(editingCard.id, {
        tag_id: values.tag_id,
        name: values.name,
        status: values.status,
      });
    } else {
      // Create new card
      createCard({
        tag_id: values.tag_id,
        name: values.name || null,
        status: values.status,
      });
    }

    setIsFormOpen(false);
  };

  // Open delete confirmation dialog
  const handleDeleteConfirm = (card: RFIDCard) => {
    setCardToDelete(card);
    setIsDeleteDialogOpen(true);
  };

  // Execute delete operation
  const confirmDelete = () => {
    if (cardToDelete) {
      deleteCard(cardToDelete.id);
      setIsDeleteDialogOpen(false);
      setCardToDelete(null);
    }
  };

  // Start RFID scanning to automatically fill the tag_id field
  const handleScanRFID = () => {
    setIsScanning(true);
    startRFIDScan();
  };

  // Update the form when a new RFID tag is scanned
  React.useEffect(() => {
    if (isScanning && scannedRFID) {
      form.setValue("tag_id", scannedRFID);
      setIsScanning(false);
    }
  }, [scannedRFID, isScanning, form]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">RFID Card Management</h2>
        <Button
          onClick={handleOpenNewCardForm}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add RFID Card
        </Button>
      </div>

      {isLoadingCards ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-center">
            <p>Loading RFID cards...</p>
          </div>
        </div>
      ) : cardsError ? (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <p className="text-red-600">Error loading RFID cards</p>
          <p className="text-sm text-red-500">{cardsError.message}</p>
        </div>
      ) : rfidCards.length === 0 ? (
        <div className="bg-muted/40 border border-border rounded-lg flex flex-col items-center justify-center py-16 px-4 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No RFID Cards Found</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            Add RFID cards to allow users to authenticate and track game
            sessions.
          </p>
          <Button onClick={handleOpenNewCardForm} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Your First RFID Card
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfidCards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono">{card.tag_id}</TableCell>
                  <TableCell>{card.name || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={card.status === "active" ? "default" : "outline"}
                    >
                      {card.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {card.last_used_at
                      ? format(new Date(card.last_used_at), "MMM d, yyyy HH:mm")
                      : "Never used"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCard(card)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteConfirm(card)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog for Create/Edit */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Edit RFID Card" : "Add RFID Card"}
            </DialogTitle>
            <DialogDescription>
              {editingCard
                ? "Update the details for this RFID card."
                : "Register a new RFID card to the system."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="tag_id"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Tag ID</FormLabel>
                      {!editingCard && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleScanRFID}
                          className="h-8 text-xs"
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <>
                              <CreditCard className="h-3.5 w-3.5 mr-1 animate-pulse" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-3.5 w-3.5 mr-1" />
                              Scan Card
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter card tag ID"
                        {...field}
                        readOnly={!!editingCard}
                        className={editingCard ? "bg-muted cursor-not-allowed" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., Staff Card, Guest Card"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <div className="flex gap-4">
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="active"
                            value="active"
                            checked={field.value === "active"}
                            onChange={() => field.onChange("active")}
                            className="focus:ring-primary h-4 w-4 text-primary"
                          />
                          <label htmlFor="active" className="text-sm font-medium">
                            Active
                          </label>
                        </div>
                      </FormControl>

                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="inactive"
                            value="inactive"
                            checked={field.value === "inactive"}
                            onChange={() => field.onChange("inactive")}
                            className="focus:ring-primary h-4 w-4 text-primary"
                          />
                          <label htmlFor="inactive" className="text-sm font-medium">
                            Inactive
                          </label>
                        </div>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingCard || isUpdatingCard}
                >
                  {isCreatingCard || isUpdatingCard ? (
                    <>Saving...</>
                  ) : editingCard ? (
                    <>Update Card</>
                  ) : (
                    <>Add Card</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete RFID Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this RFID card? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 p-4 rounded-md my-4">
            <p className="font-medium">Card Details</p>
            {cardToDelete && (
              <div className="mt-2">
                <p>
                  <span className="text-muted-foreground">Tag ID:</span>{" "}
                  <span className="font-mono">{cardToDelete.tag_id}</span>
                </p>
                {cardToDelete.name && (
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {cardToDelete.name}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeletingCard}
            >
              {isDeletingCard ? "Deleting..." : "Delete Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RfidManagementTab;
